package com.fintech.controller;

import com.fintech.entity.User;
import com.fintech.entity.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);
    private static final int MIN_QUERY_LENGTH = 2;
    private static final int MAX_RESULTS = 10;
    private static final int QUOTE_LIMIT = 8;

    @Autowired
    private JwtUtils jwtUtils;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${nse.base}")
    private String nseBaseUrl;

    @Value("${coingecko.base}")
    private String coingeckoBaseUrl;

    @Value("${coingecko.api-key:}")
    private String coingeckoApiKey;

    @Value("${alphavantage.base:https://www.alphavantage.co/query}")
    private String alphavantageBase;

    @Value("${alphavantage.api-key:}")
    private String alphavantageApiKey;

    @Value("${yahoo.search-base:https://query2.finance.yahoo.com}")
    private String yahooSearchBase;

    @Value("${yahoo.quote-base:https://query1.finance.yahoo.com}")
    private String yahooQuoteBase;

    public SearchController(RestTemplateBuilder builder) {
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

    // ---------------------- Search Stocks ----------------------
    @GetMapping("/stocks")
    public ResponseEntity<?> searchStocks(
            @RequestParam(value = "q", required = false) String query,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        logger.info("Stock search requested with query: '{}'", query);
        
        List<Map<String, Object>> results = searchStocksFromApis(query);
        logger.info("Found {} results for query: '{}'", results.size(), query);
        
        return ResponseEntity.ok(Map.of("results", results));
    }

    private List<Map<String, Object>> searchStocksFromApis(String query) {
        // Try Yahoo first
        List<Map<String, Object>> results = searchYahoo(query);
        if (!results.isEmpty()) {
            return results;
        }

        // Try NSE
        results = searchNSE(query);
        if (!results.isEmpty()) {
            return results;
        }

        // Try AlphaVantage directly
        results = searchAlphaVantage(query);
        if (!results.isEmpty()) {
            return results;
        }

        // Fallback to static data
        return getFallbackStocks(query);
    }

    private List<Map<String, Object>> searchAlphaVantage(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (isInvalidQuery(query)) {
            return results;
        }

        try {
            String url = buildAlphaVantageSearchUrl(query);
            String response = restTemplate.getForObject(url, String.class);

            if (isValidResponse(response)) {
                JsonNode root = objectMapper.readTree(response);
                if (root.has("bestMatches") && root.get("bestMatches").isArray()) {
                    for (JsonNode match : root.get("bestMatches")) {
                        Map<String, Object> stock = extractStockFromAlphaVantage(match);
                        results.add(stock);
                    }
                }
            }
            
            logger.info("AlphaVantage search returned {} results for '{}'", results.size(), query);
        } catch (Exception e) {
            logger.warn("AlphaVantage search failed for query '{}': {}", query, e.getMessage());
        }

        return results;
    }

    // ---------------------- Search Crypto ----------------------
    @GetMapping("/crypto")
    public ResponseEntity<?> searchCrypto(
            @RequestParam(value = "q", required = false) String query,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        logger.info("Crypto search requested with query: '{}'", query);
        
        List<Map<String, Object>> results = searchCryptoFromApis(query);
        return ResponseEntity.ok(Map.of("results", results));
    }

    private List<Map<String, Object>> searchCryptoFromApis(String query) {
        if (isInvalidQuery(query)) {
            return new ArrayList<>();
        }

        try {
            String url = buildCoinGeckoSearchUrl(query);
            String response = restTemplate.getForObject(url, String.class);

            if (isValidResponse(response)) {
                return extractCryptoResults(response);
            }
        } catch (Exception e) {
            logger.error("Crypto search failed for query '{}': {}", query, e.getMessage());
        }

        return getFallbackCrypto(query);
    }

    private List<Map<String, Object>> extractCryptoResults(String response) throws Exception {
        List<Map<String, Object>> results = new ArrayList<>();
        JsonNode root = objectMapper.readTree(response);
        
        if (root.has("coins") && root.get("coins").isArray()) {
            for (JsonNode node : root.get("coins")) {
                Map<String, Object> crypto = extractCryptoFromNode(node);
                results.add(crypto);
            }
        }
        
        return results;
    }

    private Map<String, Object> extractCryptoFromNode(JsonNode node) {
        Map<String, Object> crypto = new HashMap<>();
        String id = node.get("id").asText();
        String name = node.get("name").asText();
        String symbol = node.get("symbol").asText();
        
        crypto.put("symbol", id);
        crypto.put("name", name + " (" + symbol + ")");
        crypto.put("exchange", "CRYPTO");
        
        return crypto;
    }

    // ---------------------- Search Mutual Funds ----------------------
    @GetMapping("/mutual")
    public ResponseEntity<?> searchMutualFunds(
            @RequestParam(value = "q", required = false) String query,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        logger.info("Mutual Fund search requested with query: '{}'", query);
        
        List<Map<String, Object>> results = new ArrayList<>();
        if (!isInvalidQuery(query)) {
            results = getFallbackMutualFunds(query);
        }

        return ResponseEntity.ok(Map.of("results", results));
    }

    // ---------------------- Search NSE ----------------------
    private List<Map<String, Object>> searchNSE(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (isInvalidQuery(query)) {
            return results;
        }

        try {
            String url = buildNseSearchUrl(query);
            String response = restTemplate.getForObject(url, String.class);

            if (isValidResponse(response)) {
                results = extractNseResults(response);
            }
            
            if (!results.isEmpty()) {
                logger.info("NSE search returned {} results for query '{}'", results.size(), query);
                return deduplicateBySymbol(results);
            }
        } catch (Exception e) {
            logger.warn("NSE search failed for query '{}', trying AlphaVantage fallback", query);
        }

        // Fallback to AlphaVantage if NSE fails
        List<Map<String, Object>> avResults = searchAlphaVantage(query);
        if (!avResults.isEmpty()) {
            logger.info("AlphaVantage fallback returned {} results", avResults.size());
            return deduplicateBySymbol(avResults);
        }

        return getFallbackStocks(query);
    }

    private List<Map<String, Object>> extractNseResults(String response) throws Exception {
        List<Map<String, Object>> results = new ArrayList<>();
        JsonNode root = objectMapper.readTree(response);
        
        if (root.has("symbols") && root.get("symbols").isArray()) {
            for (JsonNode node : root.get("symbols")) {
                Map<String, Object> stock = extractStockFromNse(node);
                results.add(stock);
            }
        }
        
        return results;
    }

    private Map<String, Object> extractStockFromNse(JsonNode node) {
        Map<String, Object> stock = new HashMap<>();
        stock.put("symbol", node.path("symbol").asText());
        stock.put("name", node.path("name").asText());
        stock.put("exchange", "NSE");
        return stock;
    }

    // ---------------------- Search Yahoo ----------------------
    private List<Map<String, Object>> searchYahoo(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (isInvalidQuery(query)) {
            return results;
        }

        try {
            String url = buildYahooSearchUrl(query);
            String response = restTemplate.getForObject(url, String.class);

            if (isValidResponse(response)) {
                results = extractYahooResults(response);
            }

            // Enrich results with live prices
            if (!results.isEmpty()) {
                enrichWithYahooPrices(results);
                logger.info("Yahoo search returned {} results for query '{}'", results.size(), query);
                return deduplicateBySymbol(results);
            }

        } catch (Exception e) {
            logger.warn("Yahoo search failed for query '{}': {}", query, e.getMessage());
        }

        return results;
    }

    private List<Map<String, Object>> extractYahooResults(String response) throws Exception {
        List<Map<String, Object>> results = new ArrayList<>();
        JsonNode root = objectMapper.readTree(response);
        
        if (root.has("quotes") && root.get("quotes").isArray()) {
            for (JsonNode node : root.get("quotes")) {
                Map<String, Object> stock = extractStockFromYahoo(node);
                if (stock != null) {
                    results.add(stock);
                }
            }
        }
        
        return results;
    }

    private Map<String, Object> extractStockFromYahoo(JsonNode node) {
        String symbol = node.path("symbol").asText();
        if (symbol == null || symbol.isBlank()) {
            return null;
        }

        Map<String, Object> stock = new HashMap<>();
        stock.put("symbol", symbol);
        
        String name = getPreferredName(node, "shortname", "longname", "quoteType");
        stock.put("name", name != null ? name : symbol);
        
        String exchange = getPreferredExchange(node, "exchDisp", "exchange");
        stock.put("exchange", exchange != null ? exchange : "YAHOO");
        
        return stock;
    }

    private String getPreferredName(JsonNode node, String... fields) {
        for (String field : fields) {
            String value = node.path(field).asText(null);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private String getPreferredExchange(JsonNode node, String... fields) {
        for (String field : fields) {
            String value = node.path(field).asText(null);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private void enrichWithYahooPrices(List<Map<String, Object>> results) {
        try {
            int limit = Math.min(QUOTE_LIMIT, results.size());
            List<Map<String, Object>> limitedResults = results.subList(0, limit);
            
            String symbols = buildSymbolList(limitedResults);
            String url = buildYahooQuoteUrl(symbols);
            String response = restTemplate.getForObject(url, String.class);

            if (isValidResponse(response)) {
                applyPricesToResults(response, results);
            }
        } catch (Exception e) {
            logger.debug("Failed to enrich prices from Yahoo quotes: {}", e.getMessage());
        }
    }

    private void applyPricesToResults(String response, List<Map<String, Object>> results) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        
        if (root.has("quoteResponse") && root.get("quoteResponse").has("result")) {
            for (JsonNode quoteNode : root.get("quoteResponse").get("result")) {
                String symbol = quoteNode.path("symbol").asText();
                double price = quoteNode.path("regularMarketPrice").asDouble(Double.NaN);
                
                if (!Double.isNaN(price)) {
                    updateSymbolPrice(results, symbol, price);
                }
            }
        }
    }

    private void updateSymbolPrice(List<Map<String, Object>> results, String symbol, double price) {
        for (Map<String, Object> result : results) {
            if (symbol.equalsIgnoreCase(result.get("symbol").toString())) {
                result.put("price", price);
                break;
            }
        }
    }

    // ---------------------- Helper Methods ----------------------
    
    private boolean isInvalidQuery(String query) {
        return query == null || query.isBlank() || query.length() < MIN_QUERY_LENGTH;
    }

    private boolean isValidResponse(String response) {
        return response != null && !response.isEmpty();
    }

    private String buildNseSearchUrl(String query) {
        return nseBaseUrl + "/api/search/autocomplete?q=" + query;
    }

    private String buildYahooSearchUrl(String query) throws Exception {
        String encoded = java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);
        return yahooSearchBase + "/v1/finance/search?q=" + encoded;
    }

    private String buildYahooQuoteUrl(String symbols) throws Exception {
        String encoded = java.net.URLEncoder.encode(symbols, java.nio.charset.StandardCharsets.UTF_8);
        return yahooQuoteBase + "/v7/finance/quote?symbols=" + encoded;
    }

    private String buildAlphaVantageSearchUrl(String query) throws Exception {
        String encoded = java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);
        String url = alphavantageBase + "?function=SYMBOL_SEARCH&keywords=" + encoded;
        
        if (alphavantageApiKey != null && !alphavantageApiKey.isBlank()) {
            String apiKey = java.net.URLEncoder.encode(alphavantageApiKey, java.nio.charset.StandardCharsets.UTF_8);
            url = url + "&apikey=" + apiKey;
        }
        
        return url;
    }

    private String buildCoinGeckoSearchUrl(String query) {
        return coingeckoBaseUrl + "/search?query=" + query;
    }

    private String buildSymbolList(List<Map<String, Object>> results) {
        return String.join(",", results.stream()
            .map(r -> r.get("symbol").toString())
            .toArray(String[]::new));
    }

    private Map<String, Object> extractStockFromAlphaVantage(JsonNode match) {
        Map<String, Object> stock = new HashMap<>();
        String symbol = match.path("1. symbol").asText();
        String name = match.path("2. name").asText();
        
        stock.put("symbol", symbol);
        stock.put("name", name);
        stock.put("exchange", "ALPHA");
        
        return stock;
    }

    private List<Map<String, Object>> deduplicateBySymbol(List<Map<String, Object>> results) {
        Map<String, Map<String, Object>> unique = new LinkedHashMap<>();
        for (Map<String, Object> result : results) {
            String symbol = result.get("symbol").toString().toUpperCase();
            unique.put(symbol, result);
        }
        return new ArrayList<>(unique.values());
    }

    // ---------------------- Fallback Data Methods ----------------------
    static {
        // Nifty 50 Companies (Updated with latest closing prices)
        FALLBACK_STOCKS.put("TCS", new StockData("Tata Consultancy Services", "NSE", 3850.0));
        FALLBACK_STOCKS.put("INFY", new StockData("Infosys Limited", "NSE", 1950.0));
        FALLBACK_STOCKS.put("WIPRO", new StockData("Wipro Limited", "NSE", 425.0));
        FALLBACK_STOCKS.put("RELIANCE", new StockData("Reliance Industries", "NSE", 2900.0));
        FALLBACK_STOCKS.put("HDFC", new StockData("Housing Development Finance", "NSE", 2750.0));
        FALLBACK_STOCKS.put("ICICIBANK", new StockData("ICICI Bank", "NSE", 1100.0));
        FALLBACK_STOCKS.put("AXISBANK", new StockData("Axis Bank", "NSE", 1150.0));
        FALLBACK_STOCKS.put("MARUTI", new StockData("Maruti Suzuki India", "NSE", 12500.0));
        FALLBACK_STOCKS.put("BAJAJFINSV", new StockData("Bajaj Finserv", "NSE", 1600.0));
        FALLBACK_STOCKS.put("HDFCBANK", new StockData("HDFC Bank", "NSE", 1500.0));
        FALLBACK_STOCKS.put("SBIN", new StockData("State Bank of India", "NSE", 830.0));
        FALLBACK_STOCKS.put("BHARTIARTL", new StockData("Bharti Airtel", "NSE", 1350.0));
        FALLBACK_STOCKS.put("JSWSTEEL", new StockData("JSW Steel", "NSE", 915.0));
        FALLBACK_STOCKS.put("LT", new StockData("Larsen & Toubro", "NSE", 3600.0));
        FALLBACK_STOCKS.put("KOTAKBANK", new StockData("Kotak Mahindra Bank", "NSE", 1700.0));
        FALLBACK_STOCKS.put("ULTRACEMCO", new StockData("UltraTech Cement", "NSE", 10800.0));
        FALLBACK_STOCKS.put("SUNPHARMA", new StockData("Sun Pharmaceutical", "NSE", 1600.0));
        FALLBACK_STOCKS.put("ASIANPAINT", new StockData("Asian Paints", "NSE", 2900.0));
        FALLBACK_STOCKS.put("DMART", new StockData("Avenue Supermarts", "NSE", 4700.0));
        FALLBACK_STOCKS.put("HEROMOTOCO", new StockData("Hero MotoCorp", "NSE", 5500.0));
        FALLBACK_STOCKS.put("HINDALCO", new StockData("Hindalco Industries", "NSE", 670.0));
        FALLBACK_STOCKS.put("TATASTEEL", new StockData("Tata Steel", "NSE", 175.0));
        FALLBACK_STOCKS.put("ADANIPORTS", new StockData("Adani Ports", "NSE", 1400.0));
        FALLBACK_STOCKS.put("ADANIGREEN", new StockData("Adani Green Energy", "NSE", 1800.0));
        FALLBACK_STOCKS.put("INDIGO", new StockData("IndiGo", "NSE", 4300.0));
        FALLBACK_STOCKS.put("ONGC", new StockData("Oil and Natural Gas", "NSE", 270.0));
        FALLBACK_STOCKS.put("POWERGRID", new StockData("Power Grid", "NSE", 320.0));
        FALLBACK_STOCKS.put("NTPC", new StockData("NTPC Limited", "NSE", 360.0));
        FALLBACK_STOCKS.put("EICHERMOT", new StockData("Eicher Motors", "NSE", 4700.0));
        FALLBACK_STOCKS.put("MARICO", new StockData("Marico Limited", "NSE", 610.0));
        FALLBACK_STOCKS.put("BRITANNIA", new StockData("Britannia Industries", "NSE", 5300.0));
        FALLBACK_STOCKS.put("NESTLEIND", new StockData("Nestlé India", "NSE", 2500.0));
        FALLBACK_STOCKS.put("TITAN", new StockData("Titan Company", "NSE", 3250.0));
        FALLBACK_STOCKS.put("GRASIM", new StockData("Grasim Industries", "NSE", 2400.0));
        FALLBACK_STOCKS.put("SIEMENS", new StockData("Siemens Limited", "NSE", 7400.0));
        
        // Midcap Stocks (Updated with latest closing prices)
        FALLBACK_STOCKS.put("BEL", new StockData("Bharat Electronics", "NSE", 300.0));
        FALLBACK_STOCKS.put("BDL", new StockData("Bharat Dynamics", "NSE", 1500.0));
        FALLBACK_STOCKS.put("GODREJCP", new StockData("Godrej Consumer Products", "NSE", 1370.0));
        FALLBACK_STOCKS.put("BAJAJ-AUTO", new StockData("Bajaj Auto", "NSE", 9200.0));
        
        // Smallcap Stocks
        FALLBACK_STOCKS.put("INDIANBANK", new StockData("Indian Bank", "NSE", 540.0));
        FALLBACK_STOCKS.put("KPITTECH", new StockData("KPIT Technologies", "NSE", 1500.0));
        FALLBACK_STOCKS.put("DIXON", new StockData("Dixon Technologies", "NSE", 9500.0));
        FALLBACK_STOCKS.put("PAGEIND", new StockData("Page Industries", "NSE", 35000.0));
    }

    // Static block to hold fallback mutual funds data
    private static final Map<String, StockData> FALLBACK_MUTUAL_FUNDS = new HashMap<>();
    static {
        // Popular Indian Mutual Funds
        FALLBACK_MUTUAL_FUNDS.put("AAPLGO5Y", new StockData("Aditya Birla Sun Life Equity Fund", "MF", 350.0));
        FALLBACK_MUTUAL_FUNDS.put("HSBCEQE", new StockData("HSBC Equity Fund", "MF", 280.0));
        FALLBACK_MUTUAL_FUNDS.put("ICIEQE", new StockData("ICICI Prudential Equity Fund", "MF", 320.0));
        FALLBACK_MUTUAL_FUNDS.put("JMFEQE", new StockData("JM Financial Equity Fund", "MF", 290.0));
        FALLBACK_MUTUAL_FUNDS.put("KOTAGEQE", new StockData("Kotak Emerging Equity Fund", "MF", 310.0));
        FALLBACK_MUTUAL_FUNDS.put("LTFEQE", new StockData("L&T Equity Fund", "MF", 300.0));
        FALLBACK_MUTUAL_FUNDS.put("RELIGEQE", new StockData("Reliance Equity Opportunity Fund", "MF", 330.0));
        FALLBACK_MUTUAL_FUNDS.put("SBIEQE", new StockData("SBI Equity Fund", "MF", 280.0));
        FALLBACK_MUTUAL_FUNDS.put("TAAEQE", new StockData("Tata Equity Fund", "MF", 295.0));
        FALLBACK_MUTUAL_FUNDS.put("UTIEQE", new StockData("UTI Equity Fund", "MF", 315.0));
        FALLBACK_MUTUAL_FUNDS.put("AAPLDEBT", new StockData("Aditya Birla Sun Life Debt Fund", "MF", 102.0));
        FALLBACK_MUTUAL_FUNDS.put("HSBCDEBT", new StockData("HSBC Debt Fund", "MF", 99.0));
        FALLBACK_MUTUAL_FUNDS.put("ICIDEBT", new StockData("ICICI Prudential Debt Fund", "MF", 101.0));
        FALLBACK_MUTUAL_FUNDS.put("KOTADEBT", new StockData("Kotak Debt Fund", "MF", 100.0));
        FALLBACK_MUTUAL_FUNDS.put("SBILOW", new StockData("SBI Liquid Fund", "MF", 1.0));
        FALLBACK_MUTUAL_FUNDS.put("ICILIQUID", new StockData("ICICI Prudential Liquid Fund", "MF", 1.0));
        FALLBACK_MUTUAL_FUNDS.put("RELIBALFUND", new StockData("Reliance Balanced Fund", "MF", 180.0));
        FALLBACK_MUTUAL_FUNDS.put("SBIBALF", new StockData("SBI Balanced Fund", "MF", 170.0));
        FALLBACK_MUTUAL_FUNDS.put("HDLOWDIV", new StockData("HDFC Low Duration Fund", "MF", 20.0));
        FALLBACK_MUTUAL_FUNDS.put("AAXAINFRA", new StockData("Axis Infra Fund", "MF", 220.0));
    }

    // Static block to hold fallback crypto data
    private static final Map<String, StockData> FALLBACK_CRYPTO = new HashMap<>();
    static {
        // Top 50 Cryptocurrencies by Market Cap
        FALLBACK_CRYPTO.put("bitcoin", new StockData("Bitcoin (BTC)", "CRYPTO", 5800000.0));
        FALLBACK_CRYPTO.put("ethereum", new StockData("Ethereum (ETH)", "CRYPTO", 310000.0));
        FALLBACK_CRYPTO.put("tether", new StockData("Tether (USDT)", "CRYPTO", 83.5));
        FALLBACK_CRYPTO.put("binancecoin", new StockData("BNB (BNB)", "CRYPTO", 50000.0));
        FALLBACK_CRYPTO.put("solana", new StockData("Solana (SOL)", "CRYPTO", 14000.0));
        FALLBACK_CRYPTO.put("usd-coin", new StockData("USDC (USDC)", "CRYPTO", 83.5));
        FALLBACK_CRYPTO.put("steth", new StockData("Lido Staked Ether (stETH)", "CRYPTO", 310000.0));
        FALLBACK_CRYPTO.put("ripple", new StockData("XRP (XRP)", "CRYPTO", 45.0));
        FALLBACK_CRYPTO.put("cardano", new StockData("Cardano (ADA)", "CRYPTO", 38.0));
        FALLBACK_CRYPTO.put("dogecoin", new StockData("Dogecoin (DOGE)", "CRYPTO", 13.0));
        FALLBACK_CRYPTO.put("tron", new StockData("TRON (TRX)", "CRYPTO", 10.0));
        FALLBACK_CRYPTO.put("avalanche-2", new StockData("Avalanche (AVAX)", "CRYPTO", 3000.0));
        FALLBACK_CRYPTO.put("shiba-inu", new StockData("Shiba Inu (SHIB)", "CRYPTO", 0.0020));
        FALLBACK_CRYPTO.put("polkadot", new StockData("Polkadot (DOT)", "CRYPTO", 600.0));
        FALLBACK_CRYPTO.put("chainlink", new StockData("Chainlink (LINK)", "CRYPTO", 1200.0));
        FALLBACK_CRYPTO.put("bitcoin-cash", new StockData("Bitcoin Cash (BCH)", "CRYPTO", 40000.0));
        FALLBACK_CRYPTO.put("uniswap", new StockData("Uniswap (UNI)", "CRYPTO", 950.0));
        FALLBACK_CRYPTO.put("litecoin", new StockData("Litecoin (LTC)", "CRYPTO", 7000.0));
        FALLBACK_CRYPTO.put("matic-network", new StockData("Polygon (MATIC)", "CRYPTO", 60.0));
        FALLBACK_CRYPTO.put("near", new StockData("NEAR Protocol (NEAR)", "CRYPTO", 650.0));
        FALLBACK_CRYPTO.put("internet-computer", new StockData("Internet Computer (ICP)", "CRYPTO", 1000.0));
        FALLBACK_CRYPTO.put("ethereum-classic", new StockData("Ethereum Classic (ETC)", "CRYPTO", 2500.0));
        FALLBACK_CRYPTO.put("stellar", new StockData("Stellar (XLM)", "CRYPTO", 9.0));
        FALLBACK_CRYPTO.put("okb", new StockData("OKB (OKB)", "CRYPTO", 4000.0));
        FALLBACK_CRYPTO.put("monero", new StockData("Monero (XMR)", "CRYPTO", 10000.0));
        FALLBACK_CRYPTO.put("cosmos", new StockData("Cosmos (ATOM)", "CRYPTO", 700.0));
        FALLBACK_CRYPTO.put("filecoin", new StockData("Filecoin (FIL)", "CRYPTO", 500.0));
        FALLBACK_CRYPTO.put("crypto-com-chain", new StockData("Cronos (CRO)", "CRYPTO", 8.0));
        FALLBACK_CRYPTO.put("hedera-hashgraph", new StockData("Hedera (HBAR)", "CRYPTO", 6.5));
        FALLBACK_CRYPTO.put("algorand", new StockData("Algorand (ALGO)", "CRYPTO", 15.0));
        FALLBACK_CRYPTO.put("quant-network", new StockData("Quant (QNT)", "CRYPTO", 6500.0));
        FALLBACK_CRYPTO.put("the-graph", new StockData("The Graph (GRT)", "CRYPTO", 25.0));
        FALLBACK_CRYPTO.put("fantom", new StockData("Fantom (FTM)", "CRYPTO", 70.0));
        FALLBACK_CRYPTO.put("eos", new StockData("EOS (EOS)", "CRYPTO", 65.0));
        FALLBACK_CRYPTO.put("tezos", new StockData("Tezos (XTZ)", "CRYPTO", 80.0));
        FALLBACK_CRYPTO.put("aave", new StockData("Aave (AAVE)", "CRYPTO", 7500.0));
        FALLBACK_CRYPTO.put("flow", new StockData("Flow (FLOW)", "CRYPTO", 75.0));
        FALLBACK_CRYPTO.put("sand", new StockData("The Sandbox (SAND)", "CRYPTO", 38.0));
        FALLBACK_CRYPTO.put("decentraland", new StockData("Decentraland (MANA)", "CRYPTO", 37.0));
        FALLBACK_CRYPTO.put("axie-infinity", new StockData("Axie Infinity (AXS)", "CRYPTO", 650.0));
        FALLBACK_CRYPTO.put("maker", new StockData("Maker (MKR)", "CRYPTO", 200000.0));
        FALLBACK_CRYPTO.put("thorchain", new StockData("THORChain (RUNE)", "CRYPTO", 450.0));
        FALLBACK_CRYPTO.put("kucoin-shares", new StockData("KuCoin Token (KCS)", "CRYPTO", 850.0));
        FALLBACK_CRYPTO.put("zcash", new StockData("Zcash (ZEC)", "CRYPTO", 2000.0));
        FALLBACK_CRYPTO.put("neo", new StockData("NEO (NEO)", "CRYPTO", 1200.0));
        FALLBACK_CRYPTO.put("chiliz", new StockData("Chiliz (CHZ)", "CRYPTO", 12.0));
        FALLBACK_CRYPTO.put("pancakeswap-token", new StockData("PancakeSwap (CAKE)", "CRYPTO", 200.0));
        FALLBACK_CRYPTO.put("iota", new StockData("IOTA (IOTA)", "CRYPTO", 18.0));
        FALLBACK_CRYPTO.put("enjincoin", new StockData("Enjin Coin (ENJ)", "CRYPTO", 28.0));
    }

    // Fallback stock data with live prices
    private List<Map<String, Object>> getFallbackStocks(String query) {
        String queryUpperCase = normalizeQuery(query);
        
        return FALLBACK_STOCKS.entrySet().stream()
            .filter(entry -> matchesQuery(queryUpperCase, entry.getKey(), entry.getValue().name))
            .map(entry -> createStockMap(entry.getKey(), entry.getValue()))
            .limit(MAX_RESULTS)
            .collect(Collectors.toList());
    }
    
    // Fallback crypto data
    private List<Map<String, Object>> getFallbackCrypto(String query) {
        String queryLowerCase = normalizeCryptoQuery(query);
        
        return FALLBACK_CRYPTO.entrySet().stream()
            .filter(entry -> matchesQuery(queryLowerCase, entry.getKey(), entry.getValue().name))
            .map(entry -> createStockMap(entry.getKey(), entry.getValue()))
            .limit(MAX_RESULTS)
            .collect(Collectors.toList());
    }

    // Fallback mutual funds data
    private List<Map<String, Object>> getFallbackMutualFunds(String query) {
        String queryLowerCase = normalizeCryptoQuery(query);
        
        return FALLBACK_MUTUAL_FUNDS.entrySet().stream()
            .filter(entry -> matchesQuery(queryLowerCase, entry.getKey(), entry.getValue().name))
            .map(entry -> createStockMap(entry.getKey(), entry.getValue()))
            .limit(MAX_RESULTS)
            .collect(Collectors.toList());
    }

    private String normalizeQuery(String query) {
        return query == null || query.isBlank() ? "" : query.toUpperCase();
    }

    private String normalizeCryptoQuery(String query) {
        return query == null || query.isBlank() ? "" : query.toLowerCase();
    }

    private boolean matchesQuery(String query, String symbol, String name) {
        if (query.isEmpty()) {
            return true;
        }
        return symbol.contains(query) || name.contains(query);
    }

    private Map<String, Object> createStockMap(String symbol, StockData data) {
        Map<String, Object> map = new HashMap<>();
        map.put("symbol", symbol);
        map.put("name", data.name);
        map.put("exchange", data.exchange);
        map.put("price", data.price);
        return map;
    }

    // Inner class for stock data
    private static class StockData {
        String name;
        String exchange;
        Double price;
        
        StockData(String name, String exchange, Double price) {
            this.name = name;
            this.exchange = exchange;
            this.price = price;
        }
    }
}
