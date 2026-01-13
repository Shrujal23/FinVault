package com.fintech.controller;

import com.fintech.entity.Asset;
import com.fintech.entity.User;
import com.fintech.service.AssetService;
import com.fintech.entity.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import java.util.*;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private JwtUtils jwtUtils;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${nse.base}")
    private String nseBaseUrl;

    @Value("${coingecko.base}")
    private String coingeckoBaseUrl;

    @Value("${coingecko.api-key}")
    private String coingeckoApiKey;
    
    public PortfolioController(RestTemplateBuilder builder) {
        // Build RestTemplate with User-Agent to avoid blocking by NSE
        this.restTemplate = builder
            .interceptors((request, body, execution) -> {
                request.getHeaders().set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                request.getHeaders().set("Accept", "application/json");
                request.getHeaders().set("x-cg-demo-api-key", coingeckoApiKey); // Add API key to headers
                return execution.execute(request, body);
            })
            .build();
    }

    // Get live stock prices for a specific list of symbols in parallel
    private Map<String, Double> getLiveStockPrices(List<String> symbols) {
        Map<String, Double> fallbackPrices = getFallbackStockPrices();

        // Fetch prices in parallel using CompletableFuture
        List<CompletableFuture<Map.Entry<String, Double>>> futures = symbols.stream()
            .map(symbol -> CompletableFuture.supplyAsync(() -> {
                Double livePrice = fetchPriceFromNSE(symbol);
                if (livePrice != null && livePrice > 0) {
                    System.out.println("[PortfolioController] Live NSE price for " + symbol.toUpperCase() + ": ₹" + livePrice);
                    return Map.entry(symbol.toUpperCase(), livePrice);
                }
                // Try Alphavantage via AssetService
                try {
                    var alt = assetService.getLivePrice(symbol);
                    if (alt != null && alt.doubleValue() > 0) {
                        double v = alt.doubleValue();
                        System.out.println("[PortfolioController] Live AlphaVantage price for " + symbol.toUpperCase() + ": ₹" + v);
                        return Map.entry(symbol.toUpperCase(), v);
                    }
                } catch (Exception ignored) {}
                // Use fallback if both live sources fail
                return Map.entry(symbol.toUpperCase(), fallbackPrices.getOrDefault(symbol.toUpperCase(), 0.0));
            }))
            .collect(Collectors.toList());

        // Combine results into a single map
        return futures.stream()
            .map(CompletableFuture::join)
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }
    
    // Fetch price from NSE API for a single stock
    private Double fetchPriceFromNSE(String symbol) {
        try {
            String url = nseBaseUrl + "/api/quote-equity?symbol=" + symbol.toUpperCase() + "&json=true";
            String response = restTemplate.getForObject(url, String.class);
            
            if (response != null && !response.isEmpty()) {
                JsonNode jsonNode = objectMapper.readTree(response);
                
                // Try priceInfo object first (most common)
                if (jsonNode.has("priceInfo")) {
                    JsonNode priceInfo = jsonNode.get("priceInfo");
                    if (priceInfo.has("lastPrice")) {
                        return Double.parseDouble(priceInfo.get("lastPrice").asText().replace(",", ""));
                    }
                }
                
                // Try data array
                if (jsonNode.has("data") && jsonNode.get("data").isArray() && jsonNode.get("data").size() > 0) {
                    JsonNode data = jsonNode.get("data").get(0);
                    if (data.has("lastPrice")) {
                        return Double.parseDouble(data.get("lastPrice").asText().replace(",", ""));
                    }
                }
                
                // Try root level
                if (jsonNode.has("lastPrice")) {
                    return Double.parseDouble(jsonNode.get("lastPrice").asText().replace(",", ""));
                }
            }
        } catch (Exception e) {
            System.out.println("[PortfolioController] Failed to fetch price for " + symbol + ": " + e.getMessage());
        }
        
        return null;
    }

    // Get live crypto prices from CoinGecko API
    private Map<String, Double> getLiveCryptoPrices(List<String> cryptoIds) {
        if (cryptoIds == null || cryptoIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Double> cryptoPrices = new HashMap<>();
        try {
            String ids = String.join(",", cryptoIds).toLowerCase();
            String url = coingeckoBaseUrl + "/simple/price?ids=" + ids + "&vs_currencies=inr";
            
            System.out.println("[CoinGecko] Fetching crypto prices for: " + ids);
            String response = restTemplate.getForObject(url, String.class);

            JsonNode root = objectMapper.readTree(response);
            root.fieldNames().forEachRemaining(id -> {
                double price = root.get(id).get("inr").asDouble();
                cryptoPrices.put(id.toUpperCase(), price); // Store with uppercase symbol to match assets
            });
        } catch (Exception e) {
            System.out.println("[CoinGecko] Failed to fetch live crypto prices: " + e.getMessage() + ". Using fallback.");
            // On failure, return fallback prices for the requested IDs
            Map<String, Double> fallbackPrices = getFallbackCryptoPrices();
            for (String id : cryptoIds) {
                if (fallbackPrices.containsKey(id.toUpperCase())) {
                    cryptoPrices.put(id.toUpperCase(), fallbackPrices.get(id.toUpperCase()));
                }
            }
        }
        return cryptoPrices;
    }
    
    // Fallback crypto prices when CoinGecko API is unavailable (in INR)
    private Map<String, Double> getFallbackCryptoPrices() {
        Map<String, Double> prices = new HashMap<>();
        prices.put("BITCOIN", 5800000.0);
        prices.put("ETHEREUM", 310000.0);
        prices.put("TETHER", 83.5);
        prices.put("BINANCECOIN", 50000.0);
        prices.put("SOLANA", 14000.0);
        prices.put("USD-COIN", 83.5);
        prices.put("STETH", 310000.0);
        prices.put("RIPPLE", 45.0);
        prices.put("CARDANO", 38.0);
        prices.put("DOGECOIN", 13.0);
        prices.put("TRON", 10.0);
        prices.put("AVALANCHE-2", 3000.0);
        prices.put("SHIBA-INU", 0.0020);
        prices.put("POLKADOT", 600.0);
        prices.put("CHAINLINK", 1200.0);
        prices.put("BITCOIN-CASH", 40000.0);
        prices.put("UNISWAP", 950.0);
        prices.put("LITECOIN", 7000.0);
        prices.put("MATIC-NETWORK", 60.0);
        prices.put("NEAR", 650.0);
        prices.put("INTERNET-COMPUTER", 1000.0);
        prices.put("ETHEREUM-CLASSIC", 2500.0);
        prices.put("STELLAR", 9.0);
        prices.put("OKB", 4000.0);
        prices.put("MONERO", 10000.0);
        prices.put("COSMOS", 700.0);
        prices.put("FILECOIN", 500.0);
        prices.put("CRYPTO-COM-CHAIN", 8.0);
        prices.put("HEDERA-HASHGRAPH", 6.5);
        prices.put("ALGORAND", 15.0);
        prices.put("QUANT-NETWORK", 6500.0);
        prices.put("THE-GRAPH", 25.0);
        prices.put("FANTOM", 70.0);
        prices.put("EOS", 65.0);
        prices.put("TEZOS", 80.0);
        prices.put("AAVE", 7500.0);
        prices.put("FLOW", 75.0);
        prices.put("SAND", 38.0);
        prices.put("DECENTRALAND", 37.0);
        prices.put("AXIE-INFINITY", 650.0);
        prices.put("MAKER", 200000.0);
        prices.put("THORCHAIN", 450.0);
        prices.put("KUCOIN-SHARES", 850.0);
        prices.put("ZCASH", 2000.0);
        prices.put("NEO", 1200.0);
        prices.put("CHILIZ", 12.0);
        prices.put("PANCAKESWAP-TOKEN", 200.0);
        prices.put("IOTA", 18.0);
        prices.put("ENJINCOIN", 28.0);
        return prices;
    }

    // Fallback stock prices when NSE API is unavailable
    private Map<String, Double> getFallbackStockPrices() {
        Map<String, Double> prices = new HashMap<>();
        prices.put("TCS", 3850.0);
        prices.put("INFY", 1950.0);
        prices.put("WIPRO", 425.0);
        prices.put("RELIANCE", 2900.0);
        prices.put("HDFC", 2750.0);
        prices.put("ICICIBANK", 1100.0);
        prices.put("AXISBANK", 1150.0);
        prices.put("MARUTI", 12500.0);
        prices.put("BAJAJFINSV", 1650.0);
        prices.put("HDFCBANK", 1500.0);
        prices.put("SBIN", 830.0);
        prices.put("BHARTIARTL", 1350.0);
        prices.put("JSWSTEEL", 915.0);
        prices.put("LT", 3600.0);
        prices.put("KOTAKBANK", 1700.0);
        prices.put("ULTRACEMCO", 10800.0);
        prices.put("SUNPHARMA", 1600.0);
        prices.put("ASIANPAINT", 3180.0);
        prices.put("DMART", 4920.0);
        prices.put("HEROMOTOCO", 4180.0);
        prices.put("HINDALCO", 710.0);
        prices.put("TATASTEEL", 175.0);
        prices.put("ADANIPORTS", 1400.0);
        prices.put("ADANIGREEN", 1950.0);
        prices.put("INDIGO", 3850.0);
        prices.put("ONGC", 285.0);
        prices.put("POWERGRID", 295.0);
        prices.put("NTPC", 360.0);
        prices.put("EICHERMOT", 4050.0);
        prices.put("MARICO", 675.0);
        prices.put("BRITANNIA", 4850.0);
        prices.put("NESTLEIND", 22950.0);
        prices.put("TITAN", 3180.0);
        prices.put("GRASIM", 2950.0);
        prices.put("SIEMENS", 7400.0);
        prices.put("BEL", 300.0);
        prices.put("BDL", 1500.0);
        prices.put("GODREJCP", 1370.0);
        prices.put("BAJAJ-AUTO", 9200.0);
        prices.put("INDIANBANK", 385.0);
        prices.put("KPITTECH", 585.0);
        prices.put("DIXON", 18500.0);
        prices.put("PAGEIND", 48500.0);
        prices.put("ITC", 430.0);
        return prices;
    }

    // ---------------------- Get Portfolio Summary ----------------------
    @GetMapping("/summary")
    public ResponseEntity<?> getPortfolioSummary(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("error", "Authorization header missing"));
        }

        Optional<User> userOpt = jwtUtils.getUserFromToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        try {
            User user = userOpt.get();
            List<Asset> assets = assetService.getAssetsByUser(user);

            // 1. Separate assets by type and get their symbols
            List<String> stockSymbols = assets.stream()
                .filter(a -> a.getType() != Asset.AssetType.crypto) // Check against the enum directly
                .map(asset -> asset.getSymbol().toUpperCase())
                .distinct()
                .collect(Collectors.toList());

            List<String> cryptoSymbols = assets.stream()
                .filter(a -> a.getType() == Asset.AssetType.crypto) // Check against the enum directly
                .map(asset -> asset.getSymbol()) // For crypto, symbol is the CoinGecko ID (e.g., 'bitcoin')
                .distinct()
                .collect(Collectors.toList());

            // 2. Fetch prices for both types in parallel
            CompletableFuture<Map<String, Double>> stockPricesFuture = CompletableFuture.supplyAsync(() -> getLiveStockPrices(stockSymbols));
            CompletableFuture<Map<String, Double>> cryptoPricesFuture = CompletableFuture.supplyAsync(() -> getLiveCryptoPrices(cryptoSymbols));

            // Combine the results
            Map<String, Double> allPrices = new HashMap<>();
            allPrices.putAll(stockPricesFuture.join());
            allPrices.putAll(cryptoPricesFuture.join());

            // 3. Calculate summary and allocation in a single loop
            List<Map<String, Object>> items = new ArrayList<>();
            List<Map<String, Object>> allocation = new ArrayList<>();
            double totalPortfolioValue = 0.0;

            // First pass: Calculate market value for each asset and total portfolio value
            for (Asset asset : assets) {
                Map<String, Object> itemMap = new HashMap<>();
                String symbolUpper = asset.getSymbol() != null ? asset.getSymbol().toUpperCase() : "";
                Double livePrice = allPrices.getOrDefault(symbolUpper, asset.getAvgBuyPrice() != null ? asset.getAvgBuyPrice().doubleValue() : 0.0);
                Double marketValue = asset.getQuantity() != null ? asset.getQuantity().doubleValue() * livePrice : 0.0;

                itemMap.put("id", asset.getId());
                itemMap.put("type", asset.getType() != null ? asset.getType() : Asset.AssetType.stock);
                itemMap.put("name", asset.getName());
                itemMap.put("symbol", asset.getSymbol());
                itemMap.put("quantity", asset.getQuantity());
                itemMap.put("avgBuyPrice", asset.getAvgBuyPrice());
                itemMap.put("lastPriceINR", livePrice);
                itemMap.put("marketValue", marketValue);
                totalPortfolioValue += marketValue;

                Double costPrice = (asset.getQuantity() != null && asset.getAvgBuyPrice() != null) ? asset.getQuantity().doubleValue() * asset.getAvgBuyPrice().doubleValue() : 0.0;
                Double pnl = marketValue - costPrice;
                itemMap.put("pnl", pnl);

                Double returnPct = costPrice > 0 ? (pnl / costPrice) * 100 : 0.0;
                itemMap.put("returnPct", returnPct);

                items.add(itemMap);
            }

            // Second pass: Calculate allocation weights now that we have the total portfolio value
            for (Map<String, Object> item : items) {
                Map<String, Object> allocationItem = new HashMap<>();
                allocationItem.put("name", item.get("name"));
                allocationItem.put("symbol", item.get("symbol"));
                Double itemMarketValue = (Double) item.get("marketValue");
                Double weight = totalPortfolioValue > 0 ? (itemMarketValue / totalPortfolioValue) * 100 : 0.0;
                allocationItem.put("value", itemMarketValue);
                allocationItem.put("weight", weight);
                allocation.add(allocationItem);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("allocation", allocation);
            response.put("items", items);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("[PortfolioController.getPortfolioSummary] Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}