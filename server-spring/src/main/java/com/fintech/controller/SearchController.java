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

    @Autowired
    private JwtUtils jwtUtils;
    
    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${nse.base}")
    private String nseBaseUrl;

    @Value("${coingecko.base}")
    private String coingeckoBaseUrl;

    @Value("${coingecko.api-key:}")
    private String coingeckoApiKey;

    // AlphaVantage fallback/search
    @Value("${alphavantage.base:https://www.alphavantage.co/query}")
    private String alphavantageBase;

    @Value("${alphavantage.api-key:}")
    private String alphavantageApiKey;

    // Yahoo free endpoints (search + quote)
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
        
        if (token == null || token.isBlank()) {
            logger.warn("Authorization header missing");
            return ResponseEntity.status(401).body(Map.of("error", "Authorization header missing"));
        }

        Optional<User> userOpt = jwtUtils.getUserFromToken(token);
        if (userOpt.isEmpty()) {
            logger.warn("Invalid token received");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        try {
            // Try Yahoo search first (free, no key required)
            List<Map<String, Object>> apiResults = searchYahoo(query);
            if (apiResults.isEmpty()) {
                // Try NSE and fallbacks as before
                apiResults = searchNSE(query);
            }

            // If still empty, attempt AlphaVantage directly and log responses for debugging
            if (apiResults.isEmpty()) {
                logger.debug("No results from Yahoo/NSE for '{}', attempting AlphaVantage direct search.", query);
                try {
                    List<Map<String, Object>> avResults = new ArrayList<>();
                    String avUrl = alphavantageBase + "?function=SYMBOL_SEARCH&keywords=" + java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);
                    if (alphavantageApiKey != null && !alphavantageApiKey.isBlank()) {
                        avUrl = avUrl + "&apikey=" + java.net.URLEncoder.encode(alphavantageApiKey, java.nio.charset.StandardCharsets.UTF_8);
                    }
                    logger.debug("AlphaVantage direct search URL: {}", avUrl);
                    String avResp = restTemplate.getForObject(avUrl, String.class);
                    logger.debug("AlphaVantage raw response length: {}", avResp == null ? 0 : avResp.length());
                    if (avResp != null && !avResp.isEmpty()) {
                        JsonNode root = objectMapper.readTree(avResp);
                        if (root.has("bestMatches") && root.get("bestMatches").isArray()) {
                            for (JsonNode match : root.get("bestMatches")) {
                                Map<String, Object> stock = new HashMap<>();
                                String symbol = match.path("1. symbol").asText();
                                String name = match.path("2. name").asText();
                                stock.put("symbol", symbol);
                                stock.put("name", name);
                                stock.put("exchange", "ALPHA");
                                avResults.add(stock);
                            }
                        }
                    }
                    if (!avResults.isEmpty()) {
                        apiResults = avResults;
                        logger.info("AlphaVantage direct search returned {} results for '{}'.", avResults.size(), query);
                    }
                } catch (Exception e) {
                    logger.warn("AlphaVantage direct search failed for query '{}': {}", query, e.toString());
                }
            }

            logger.info("Found {} results for query: '{}'", apiResults.size(), query);
            return ResponseEntity.ok(Map.of("results", apiResults));

        } catch (Exception e) {
            logger.error("Error during stock search for query: '{}'", query, e);
            // In case of an unexpected error, return an empty list.
            return ResponseEntity.status(500).body(Map.of("error", "An internal error occurred during search."));
        }
    }

    // ---------------------- Search Crypto ----------------------
    @GetMapping("/crypto")
    public ResponseEntity<?> searchCrypto(
            @RequestParam(value = "q", required = false) String query,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        logger.info("Crypto search requested with query: '{}'", query);
        
        if (token == null || token.isBlank()) {
            logger.warn("Authorization header missing for crypto search");
            return ResponseEntity.status(401).body(Map.of("error", "Authorization header missing"));
        }

        if (jwtUtils.getUserFromToken(token).isEmpty()) {
            logger.warn("Invalid token received for crypto search");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        List<Map<String, Object>> results = new ArrayList<>();
        if (query == null || query.isBlank() || query.length() < 2) {
            return ResponseEntity.ok(Map.of("results", results));
        }

        try {
            String url = coingeckoBaseUrl + "/search?query=" + query;
            logger.debug("Fetching from CoinGecko search API: {}", url);
            String response = restTemplate.getForObject(url, String.class);

            if (response != null && !response.isEmpty()) {
                JsonNode root = objectMapper.readTree(response);
                if (root.has("coins") && root.get("coins").isArray()) {
                    for (JsonNode node : root.get("coins")) {
                        Map<String, Object> crypto = new HashMap<>();
                        crypto.put("symbol", node.get("id").asText()); // Use 'id' for adding asset
                        crypto.put("name", node.get("name").asText() + " (" + node.get("symbol").asText() + ")");
                        crypto.put("exchange", "CRYPTO");
                        results.add(crypto);
                    }
                }
            }
            return ResponseEntity.ok(Map.of("results", results));
        } catch (Exception e) {
            logger.error("Error during crypto search for query: '{}'", query, e);
            // If live API fails, use the local fallback list
            return ResponseEntity.ok(Map.of("results", getFallbackCrypto(query)));
        }
    }

    // ---------------------- Search Mutual Funds ----------------------
    @GetMapping("/mutual")
    public ResponseEntity<?> searchMutualFunds(
            @RequestParam(value = "q", required = false) String query,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        logger.info("Mutual Fund search requested with query: '{}'", query);
        
        if (token == null || token.isBlank()) {
            logger.warn("Authorization header missing for MF search");
            return ResponseEntity.status(401).body(Map.of("error", "Authorization header missing"));
        }

        if (jwtUtils.getUserFromToken(token).isEmpty()) {
            logger.warn("Invalid token received for MF search");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        List<Map<String, Object>> results = new ArrayList<>();
        if (query == null || query.isBlank() || query.length() < 2) {
            return ResponseEntity.ok(Map.of("results", results));
        }

        try {
            // Use fallback MF list with simple filtering
            results = getFallbackMutualFunds(query);
            return ResponseEntity.ok(Map.of("results", results));
        } catch (Exception e) {
            logger.error("Error during mutual fund search for query: '{}'", query, e);
            return ResponseEntity.ok(Map.of("results", getFallbackMutualFunds(query)));
        }
    }

    // Search NSE using the correct autocomplete endpoint, with alphavantage fallback
    private List<Map<String, Object>> searchNSE(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (query == null || query.isBlank() || query.length() < 2) {
            return results; // Don't search for very short queries
        }

        boolean usedLive = false;
        try {
            String url = nseBaseUrl + "/api/search/autocomplete?q=" + query;
            logger.debug("Fetching from NSE search API: {}", url);
            String response = restTemplate.getForObject(url, String.class);

            if (response != null && !response.isEmpty()) {
                JsonNode root = objectMapper.readTree(response);
                if (root.has("symbols") && root.get("symbols").isArray()) {
                    for (JsonNode node : root.get("symbols")) {
                        Map<String, Object> stock = new HashMap<>();
                        stock.put("symbol", node.path("symbol").asText());
                        stock.put("name", node.path("name").asText());
                        stock.put("exchange", "NSE"); // All results from this API are NSE
                        results.add(stock);
                    }
                }
            }

            if (!results.isEmpty()) {
                usedLive = true;
                logger.info("Using NSE live search for query {} returned {} results", query, results.size());
            }
        } catch (Exception e) {
            logger.warn("NSE live search failed for query '{}', will attempt AlphaVantage fallback.", query);
        }

        // If NSE failed or returned empty, try Alpha Vantage SYMBOL_SEARCH as a fallback
        if (!usedLive) {
            try {
                String avUrl = alphavantageBase + "?function=SYMBOL_SEARCH&keywords=" + java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);
                if (alphavantageApiKey != null && !alphavantageApiKey.isBlank()) {
                    avUrl = avUrl + "&apikey=" + java.net.URLEncoder.encode(alphavantageApiKey, java.nio.charset.StandardCharsets.UTF_8);
                }
                logger.debug("Fetching from AlphaVantage symbol search: {}", avUrl);
                String avResp = restTemplate.getForObject(avUrl, String.class);
                if (avResp != null && !avResp.isEmpty()) {
                    JsonNode root = objectMapper.readTree(avResp);
                    if (root.has("bestMatches") && root.get("bestMatches").isArray()) {
                        for (JsonNode match : root.get("bestMatches")) {
                            Map<String, Object> stock = new HashMap<>();
                            String symbol = match.path("1. symbol").asText();
                            String name = match.path("2. name").asText();
                            stock.put("symbol", symbol);
                            stock.put("name", name);
                            stock.put("exchange", "ALPHA");
                            results.add(stock);
                        }
                    }
                }

                if (!results.isEmpty()) {
                    logger.info("Using AlphaVantage fallback for query {} returned {} results", query, results.size());
                }
            } catch (Exception e) {
                logger.error("AlphaVantage fallback failed for query '{}'. Returning static fallback.", query, e);
                return getFallbackStocks(query);
            }
        }

        // If still empty, return static fallback
        if (results.isEmpty()) {
            return getFallbackStocks(query);
        }

        // Deduplicate by symbol
        Map<String, Map<String, Object>> unique = new LinkedHashMap<>();
        for (Map<String, Object> r : results) {
            unique.put(((String) r.get("symbol")).toUpperCase(), r);
        }

        return new ArrayList<>(unique.values());
    }

    // Try Yahoo search endpoint first (free, no API key required)
    private List<Map<String, Object>> searchYahoo(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (query == null || query.isBlank() || query.length() < 2) return results;

        try {
            String url = yahooSearchBase + "/v1/finance/search?q=" + java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);
            logger.debug("Fetching from Yahoo search API: {}", url);
            String resp = restTemplate.getForObject(url, String.class);
            logger.debug("Yahoo raw response length: {}", resp == null ? 0 : resp.length());
            if (resp != null && !resp.isEmpty()) {
                JsonNode root = objectMapper.readTree(resp);
                if (root.has("quotes") && root.get("quotes").isArray()) {
                    for (JsonNode q : root.get("quotes")) {
                        String symbol = q.path("symbol").asText();
                        if (symbol == null || symbol.isBlank()) continue;
                        Map<String, Object> stock = new HashMap<>();
                        stock.put("symbol", symbol);
                        String name = q.path("shortname").asText(null);
                        if (name == null) name = q.path("longname").asText(null);
                        if (name == null) name = q.path("quoteType").asText(null);
                        stock.put("name", name != null ? name : symbol);
                        String exch = q.path("exchDisp").asText(null);
                        if (exch == null) exch = q.path("exchange").asText(null);
                        stock.put("exchange", exch != null ? exch : "YAHOO");
                        results.add(stock);
                    }
                } else {
                    logger.debug("Yahoo search returned no 'quotes' array for query: {}", query);
                }
            } else {
                logger.debug("Yahoo search returned empty response for query: {}", query);
            }

            // Enrich with live prices via quote endpoint for top N results
            if (!results.isEmpty()) {
                int limit = Math.min(8, results.size());
                String symbols = String.join(",", results.subList(0, limit).stream().map(r -> r.get("symbol").toString()).toArray(String[]::new));
                String qUrl = yahooQuoteBase + "/v7/finance/quote?symbols=" + java.net.URLEncoder.encode(symbols, java.nio.charset.StandardCharsets.UTF_8);
                logger.debug("Fetching Yahoo quotes: {}", qUrl);
                String qResp = restTemplate.getForObject(qUrl, String.class);
                logger.debug("Yahoo quote raw response length: {}", qResp == null ? 0 : qResp.length());
                if (qResp != null && !qResp.isEmpty()) {
                    JsonNode root = objectMapper.readTree(qResp);
                    if (root.has("quoteResponse") && root.get("quoteResponse").has("result")) {
                        for (JsonNode r : root.get("quoteResponse").get("result")) {
                            String sym = r.path("symbol").asText();
                            double price = r.path("regularMarketPrice").asDouble(Double.NaN);
                            if (!Double.isNaN(price)) {
                                for (Map<String, Object> m : results) {
                                    if (sym.equalsIgnoreCase(m.get("symbol").toString())) {
                                        m.put("price", price);
                                    }
                                }
                            }
                        }
                    }
                }

                logger.info("Using Yahoo Search for query {} returned {} results", query, results.size());
            }

            // Deduplicate and return if results found
            if (!results.isEmpty()) {
                Map<String, Map<String, Object>> unique = new LinkedHashMap<>();
                for (Map<String, Object> r : results) unique.put(((String) r.get("symbol")).toUpperCase(), r);
                return new ArrayList<>(unique.values());
            }

        } catch (Exception e) {
            logger.warn("Yahoo search failed for query '{}': {}", query, e.toString());
        }

        return results;
    }

    // Static block to hold fallback stock data
    private static final Map<String, StockData> FALLBACK_STOCKS = new HashMap<>();
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
        String q = query == null || query.isBlank() ? "" : query.toUpperCase();
        
        // Filter stocks by query
        return FALLBACK_STOCKS.entrySet().stream()
            .filter(entry -> q.isEmpty() || entry.getKey().contains(q) || entry.getValue().name.toUpperCase().contains(q))
            .map(entry -> {
                Map<String, Object> result = new HashMap<>();
                result.put("symbol", entry.getKey());
                result.put("name", entry.getValue().name);
                result.put("exchange", entry.getValue().exchange);
                result.put("price", entry.getValue().price);
                return result;
            })
            .limit(10) // Limit to 10 results
            .collect(Collectors.toList());
    }
    
    // Fallback crypto data
    private List<Map<String, Object>> getFallbackCrypto(String query) {
        String q = query == null || query.isBlank() ? "" : query.toLowerCase();

        // Filter crypto by query
        return FALLBACK_CRYPTO.entrySet().stream()
            .filter(entry -> q.isEmpty() || entry.getKey().contains(q) || entry.getValue().name.toLowerCase().contains(q))
            .map(entry -> {
                Map<String, Object> result = new HashMap<>();
                result.put("symbol", entry.getKey()); // This is the CoinGecko ID
                result.put("name", entry.getValue().name);
                result.put("exchange", entry.getValue().exchange);
                result.put("price", entry.getValue().price);
                return result;
            })
            .limit(10) // Limit to 10 results
            .collect(Collectors.toList());
    }

    // Fallback mutual funds data
    private List<Map<String, Object>> getFallbackMutualFunds(String query) {
        String q = query == null || query.isBlank() ? "" : query.toLowerCase();

        // Filter MF by query
        return FALLBACK_MUTUAL_FUNDS.entrySet().stream()
            .filter(entry -> q.isEmpty() || entry.getKey().toLowerCase().contains(q) || entry.getValue().name.toLowerCase().contains(q))
            .map(entry -> {
                Map<String, Object> result = new HashMap<>();
                result.put("symbol", entry.getKey());
                result.put("name", entry.getValue().name);
                result.put("exchange", entry.getValue().exchange);
                result.put("price", entry.getValue().price);
                return result;
            })
            .limit(10) // Limit to 10 results
            .collect(Collectors.toList());
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
