package com.fintech.controller;

import com.fintech.entity.Asset;
import com.fintech.entity.User;
import com.fintech.entity.Watchlist;
import com.fintech.service.WatchlistService;
import com.fintech.entity.JwtUtils;
import com.fintech.service.AssetService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    @Autowired
    private WatchlistService watchlistService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AssetService assetService;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${nse.base}")
    private String nseBaseUrl;

    @Value("${coingecko.base}")
    private String coingeckoBaseUrl;

    @Value("${coingecko.api-key}")
    private String coingeckoApiKey;

    public WatchlistController(RestTemplateBuilder builder) {
        this.restTemplate = builder
            .interceptors((request, body, execution) -> {
                request.getHeaders().set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                request.getHeaders().set("Accept", "application/json");
                request.getHeaders().set("x-cg-demo-api-key", coingeckoApiKey);
                return execution.execute(request, body);
            })
            .build();
    }

    // ---------------------- Get User Watchlist ----------------------
    @GetMapping
    public ResponseEntity<?> getWatchlist(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("[WatchlistController.getWatchlist] Received token: " + (token != null ? token.substring(0, Math.min(30, token.length())) + "..." : "null"));
        
        if (token == null || token.isBlank()) {
            System.out.println("[WatchlistController.getWatchlist] Authorization header missing");
            return ResponseEntity.status(401).body(Map.of("error", "Authorization header missing"));
        }

        Optional<User> userOpt = jwtUtils.getUserFromToken(token);
        System.out.println("[WatchlistController.getWatchlist] getUserFromToken result: " + (userOpt.isPresent() ? "User found: " + userOpt.get().getEmail() : "User NOT found"));
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        try {
            User user = userOpt.get();
            List<Watchlist> watchlistItems = watchlistService.getWatchlistByUser(user);

            // Separate into stocks and crypto
            List<String> stockSymbols = watchlistItems.stream()
                .filter(item -> item.getType() == Asset.AssetType.stock)
                .map(Watchlist::getSymbol)
                .distinct()
                .collect(Collectors.toList());

            List<String> cryptoIds = watchlistItems.stream()
                .filter(item -> item.getType() == Asset.AssetType.crypto)
                .map(Watchlist::getSymbol)
                .distinct()
                .collect(Collectors.toList());

            // Fetch prices for both types in parallel
            CompletableFuture<Map<String, Double>> stockPricesFuture = CompletableFuture.supplyAsync(() -> getLiveStockPrices(stockSymbols));
            CompletableFuture<Map<String, Double>> cryptoPricesFuture = CompletableFuture.supplyAsync(() -> getLiveCryptoPrices(cryptoIds));

            Map<String, Double> allPrices = new HashMap<>();
            allPrices.putAll(stockPricesFuture.join());
            allPrices.putAll(cryptoPricesFuture.join());
            // local fallback for stocks in case live fetch failed for some symbols
            Map<String, Double> fallbackStocks = getFallbackStockPrices();

            // Create response with prices
            List<Map<String, Object>> responseItems = watchlistItems.stream().map(item -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", item.getId());
                map.put("type", item.getType());
                map.put("symbol", item.getSymbol());
                map.put("name", item.getName());
                String sym = item.getSymbol() != null ? item.getSymbol().toUpperCase() : "";
                Double price = allPrices.get(sym);
                if (price == null || price <= 0) {
                    // Try Alphavantage via AssetService (returns BigDecimal)
                    try {
                        var live = assetService.getLivePrice(sym);
                        if (live != null) price = live.doubleValue();
                    } catch (Exception ignored) {}
                }
                if (price == null || price <= 0) {
                    price = fallbackStocks.getOrDefault(sym, 0.0);
                }
                map.put("lastPriceINR", price);
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(responseItems);

        } catch (Exception e) {
            System.out.println("[WatchlistController.getWatchlist] Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch watchlist data."));
        }
    }

    // --- Price Fetching Logic ---

    private Map<String, Double> getLiveStockPrices(List<String> symbols) {
        if (symbols == null || symbols.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, Double> fallbackPrices = getFallbackStockPrices();

        List<CompletableFuture<Map.Entry<String, Double>>> futures = symbols.stream()
            .map(symbol -> CompletableFuture.supplyAsync(() -> {
                Double livePrice = fetchPriceFromNSE(symbol);
                if (livePrice != null && livePrice > 0) {
                    return Map.entry(symbol.toUpperCase(), livePrice);
                }
                // 2) try AssetService live price as secondary
                Double alt = null;
                try {
                    alt = assetService.getLivePrice(symbol) != null ? assetService.getLivePrice(symbol).doubleValue() : null;
                } catch (Exception ignored) {}
                if (alt != null && alt > 0) {
                    return Map.entry(symbol.toUpperCase(), alt);
                }
                // 3) fallback static
                return Map.entry(symbol.toUpperCase(), fallbackPrices.getOrDefault(symbol.toUpperCase(), 0.0));
            }))
            .collect(Collectors.toList());

        return futures.stream()
            .map(CompletableFuture::join)
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    private Map<String, Double> getLiveCryptoPrices(List<String> cryptoIds) {
        if (cryptoIds.isEmpty()) return Collections.emptyMap();
        Map<String, Double> cryptoPrices = new HashMap<>();
        try {
            String ids = String.join(",", cryptoIds).toLowerCase();
            String url = coingeckoBaseUrl + "/simple/price?ids=" + ids + "&vs_currencies=inr";
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            root.fieldNames().forEachRemaining(id -> {
                double price = root.get(id).get("inr").asDouble();
                cryptoPrices.put(id.toUpperCase(), price);
            });
        } catch (Exception e) {
            System.out.println("[WatchlistController] Failed to fetch live crypto prices: " + e.getMessage() + ". Using fallback.");
            Map<String, Double> fallbackPrices = getFallbackCryptoPrices();
            for (String id : cryptoIds) {
                String upperId = id.toUpperCase();
                if (fallbackPrices.containsKey(upperId)) {
                    cryptoPrices.put(upperId, fallbackPrices.get(upperId));
                }
            }
        }
        return cryptoPrices;
    }

    private Double fetchPriceFromNSE(String symbol) {
        try {
            String url = nseBaseUrl + "/api/quote-equity?symbol=" + symbol.toUpperCase() + "&json=true";
            String response = restTemplate.getForObject(url, String.class);
            if (response != null && !response.isEmpty()) {
                JsonNode jsonNode = objectMapper.readTree(response);
                if (jsonNode.has("priceInfo") && jsonNode.get("priceInfo").has("lastPrice")) {
                    return Double.parseDouble(jsonNode.get("priceInfo").get("lastPrice").asText().replace(",", ""));
                }
                if (jsonNode.has("data") && jsonNode.get("data").isArray() && jsonNode.get("data").size() > 0) {
                    JsonNode data = jsonNode.get("data").get(0);
                    if (data.has("lastPrice")) {
                        return Double.parseDouble(data.get("lastPrice").asText().replace(",", ""));
                    }
                }
                if (jsonNode.has("lastPrice")) {
                    return Double.parseDouble(jsonNode.get("lastPrice").asText().replace(",", ""));
                }
            }
        } catch (Exception e) {
            System.out.println("[WatchlistController] Failed to fetch NSE price for " + symbol + ": " + e.getMessage());
        }
        return null;
    }

    // --- Fallback Price Data ---

    private Map<String, Double> getFallbackCryptoPrices() {
        Map<String, Double> prices = new HashMap<>();
        prices.put("BITCOIN", 5800000.0);
        prices.put("ETHEREUM", 310000.0);
        prices.put("TETHER", 83.5);
        prices.put("BINANCECOIN", 50000.0);
        prices.put("SOLANA", 14000.0);
        prices.put("RIPPLE", 45.0);
        prices.put("CARDANO", 38.0);
        prices.put("DOGECOIN", 13.0);
        return prices;
    }

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
        prices.put("BAJAJFINSV", 1600.0);
        prices.put("HDFCBANK", 1500.0);
        prices.put("SBIN", 830.0);
        prices.put("BHARTIARTL", 1350.0);
        prices.put("JSWSTEEL", 915.0);
        prices.put("LT", 3600.0);
        prices.put("KOTAKBANK", 1700.0);
        prices.put("ULTRACEMCO", 10800.0);
        prices.put("SUNPHARMA", 1600.0);
        prices.put("ASIANPAINT", 2900.0);
        prices.put("DMART", 4700.0);
        prices.put("HEROMOTOCO", 5500.0);
        prices.put("HINDALCO", 670.0);
        prices.put("TATASTEEL", 175.0);
        prices.put("ADANIPORTS", 1400.0);
        prices.put("ADANIGREEN", 1800.0);
        prices.put("INDIGO", 4300.0);
        prices.put("ONGC", 270.0);
        prices.put("POWERGRID", 320.0);
        prices.put("NTPC", 360.0);
        prices.put("EICHERMOT", 4700.0);
        prices.put("MARICO", 610.0);
        prices.put("BRITANNIA", 5300.0);
        prices.put("NESTLEIND", 2500.0);
        prices.put("TITAN", 3250.0);
        prices.put("GRASIM", 2400.0);
        prices.put("SIEMENS", 7400.0);
        prices.put("BEL", 300.0);
        prices.put("BDL", 1500.0);
        prices.put("GODREJCP", 1370.0);
        prices.put("BAJAJ-AUTO", 9200.0);
        prices.put("ITC", 430.0); // Added ITC to the fallback list
        return prices;
    }

    // ---------------------- Add Item to Watchlist ----------------------
    @PostMapping
    public ResponseEntity<?> addWatchlistItem(@RequestHeader(value = "Authorization", required = false) String token,
                                              @RequestBody Map<String, Object> request) {
        System.out.println("[WatchlistController.addWatchlistItem] Received token: " + (token != null ? token.substring(0, Math.min(30, token.length())) + "..." : "null"));
        
        if (token == null || token.isBlank()) {
            System.out.println("[WatchlistController.addWatchlistItem] Authorization header missing");
            return ResponseEntity.status(401).body(Map.of("error", "Authorization header missing"));
        }

        Optional<User> userOpt = jwtUtils.getUserFromToken(token);
        System.out.println("[WatchlistController.addWatchlistItem] getUserFromToken result: " + (userOpt.isPresent() ? "User found: " + userOpt.get().getEmail() : "User NOT found"));
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        try {
            User user = userOpt.get();

            
            Watchlist item = new Watchlist();
            item.setUser(user);
            item.setType(Asset.AssetType.valueOf(request.get("type").toString()));
            item.setSymbol(request.get("symbol").toString());
            item.setName(request.get("name").toString());
            // ensure createdAt is populated to satisfy DB not-null constraint
            item.setCreatedAt(java.time.LocalDateTime.now());

            Watchlist savedItem = watchlistService.save(item);
            System.out.println("[WatchlistController.addWatchlistItem] Item added to watchlist: " + request.get("symbol"));
            return ResponseEntity.ok(savedItem);

        } catch (Exception e) {
            System.out.println("[WatchlistController.addWatchlistItem] Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ---------------------- Delete Item from Watchlist ----------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWatchlistItem(@RequestHeader(value = "Authorization", required = false) String token,
                                                 @PathVariable Long id) {
        System.out.println("[WatchlistController.deleteWatchlistItem] Received token: " + (token != null ? token.substring(0, Math.min(30, token.length())) + "..." : "null"));
        
        if (token == null || token.isBlank()) {
            System.out.println("[WatchlistController.deleteWatchlistItem] Authorization header missing");
            return ResponseEntity.status(401).body(Map.of("error", "Authorization header missing"));
        }

        Optional<User> userOpt = jwtUtils.getUserFromToken(token);
        System.out.println("[WatchlistController.deleteWatchlistItem] getUserFromToken result: " + (userOpt.isPresent() ? "User found: " + userOpt.get().getEmail() : "User NOT found"));
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        try {
            User user = userOpt.get();

            Watchlist item = watchlistService.getWatchlistByUser(user)
                    .stream()
                    .filter(w -> w.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Watchlist item not found or does not belong to user"));

            watchlistService.delete(item.getId());
            System.out.println("[WatchlistController.deleteWatchlistItem] Item deleted from watchlist: " + id);
            return ResponseEntity.ok(Map.of("message", "Item removed from watchlist"));

        } catch (Exception e) {
            System.out.println("[WatchlistController.deleteWatchlistItem] Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}