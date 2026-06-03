package com.fintech.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private static final Logger logger = LoggerFactory.getLogger(SearchService.class);
    private static final int MIN_QUERY_LENGTH = 2;
    private static final int MAX_RESULTS = 10;
    private static final int QUOTE_LIMIT = 8;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${nse.base}")
    private String nseBaseUrl;

    @Value("${coingecko.base}")
    private String coingeckoBaseUrl;

    @Value("${alphavantage.base:https://www.alphavantage.co/query}")
    private String alphavantageBase;

    @Value("${alphavantage.api-key:}")
    private String alphavantageApiKey;

    @Value("${yahoo.search-base:https://query2.finance.yahoo.com}")
    private String yahooSearchBase;

    @Value("${yahoo.quote-base:https://query1.finance.yahoo.com}")
    private String yahooQuoteBase;

    public SearchService(RestTemplateBuilder builder, @Value("${coingecko.api-key:}") String coingeckoApiKey) {
        this.restTemplate = builder
            .interceptors((request, body, execution) -> {
                request.getHeaders().set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                request.getHeaders().set("Accept", "application/json");
                request.getHeaders().set("x-cg-demo-api-key", coingeckoApiKey);
                return execution.execute(request, body);
            })
            .build();
    }

    public List<Map<String, Object>> searchStocks(String query) {
        List<Map<String, Object>> results = searchYahoo(query);
        if (!results.isEmpty()) return results;

        results = searchNSE(query);
        if (!results.isEmpty()) return results;

        results = searchAlphaVantage(query);
        if (!results.isEmpty()) return results;

        return getFallbackStocks(query);
    }

    public List<Map<String, Object>> searchCrypto(String query) {
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

    public List<Map<String, Object>> searchMutualFunds(String query) {
        if (isInvalidQuery(query)) {
            return new ArrayList<>();
        }
        return getFallbackMutualFunds(query);
    }

    // ---------------------- NSE & AlphaVantage Logic ----------------------
    private List<Map<String, Object>> searchNSE(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (isInvalidQuery(query)) return results;
        try {
            String url = buildNseSearchUrl(query);
            String response = restTemplate.getForObject(url, String.class);
            if (isValidResponse(response)) results = extractNseResults(response);
            if (!results.isEmpty()) {
                logger.info("NSE search returned {} results for query '{}'", results.size(), query);
                return deduplicateBySymbol(results);
            }
        } catch (Exception e) {
            logger.warn("NSE search failed for query '{}', trying AlphaVantage fallback", query);
        }

        List<Map<String, Object>> avResults = searchAlphaVantage(query);
        if (!avResults.isEmpty()) {
            logger.info("AlphaVantage fallback returned {} results", avResults.size());
            return deduplicateBySymbol(avResults);
        }
        return getFallbackStocks(query);
    }

    private List<Map<String, Object>> searchAlphaVantage(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (isInvalidQuery(query)) return results;
        try {
            String url = buildAlphaVantageSearchUrl(query);
            String response = restTemplate.getForObject(url, String.class);
            if (isValidResponse(response)) {
                JsonNode root = objectMapper.readTree(response);
                if (root.has("bestMatches") && root.get("bestMatches").isArray()) {
                    for (JsonNode match : root.get("bestMatches")) {
                        results.add(extractStockFromAlphaVantage(match));
                    }
                }
            }
            logger.info("AlphaVantage search returned {} results for '{}'", results.size(), query);
        } catch (Exception e) {
            logger.warn("AlphaVantage search failed for query '{}': {}", query, e.getMessage());
        }
        return results;
    }

    // ---------------------- Yahoo Logic ----------------------
    private List<Map<String, Object>> searchYahoo(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (isInvalidQuery(query)) return results;
        try {
            String url = buildYahooSearchUrl(query);
            String response = restTemplate.getForObject(url, String.class);
            if (isValidResponse(response)) results = extractYahooResults(response);
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

    private void enrichWithYahooPrices(List<Map<String, Object>> results) {
        try {
            int limit = Math.min(QUOTE_LIMIT, results.size());
            List<Map<String, Object>> limitedResults = results.subList(0, limit);
            String symbols = buildSymbolList(limitedResults);
            String url = buildYahooQuoteUrl(symbols);
            String response = restTemplate.getForObject(url, String.class);
            if (isValidResponse(response)) applyPricesToResults(response, results);
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
                    for (Map<String, Object> result : results) {
                        if (symbol.equalsIgnoreCase(result.get("symbol").toString())) {
                            result.put("price", price);
                            break;
                        }
                    }
                }
            }
        }
    }

    // ---------------------- JSON Extractors ----------------------
    private List<Map<String, Object>> extractCryptoResults(String response) throws Exception {
        List<Map<String, Object>> results = new ArrayList<>();
        JsonNode root = objectMapper.readTree(response);
        if (root.has("coins") && root.get("coins").isArray()) {
            for (JsonNode node : root.get("coins")) {
                Map<String, Object> crypto = new HashMap<>();
                crypto.put("symbol", node.get("id").asText());
                crypto.put("name", node.get("name").asText() + " (" + node.get("symbol").asText() + ")");
                crypto.put("exchange", "CRYPTO");
                results.add(crypto);
            }
        }
        return results;
    }

    private List<Map<String, Object>> extractNseResults(String response) throws Exception {
        List<Map<String, Object>> results = new ArrayList<>();
        JsonNode root = objectMapper.readTree(response);
        if (root.has("symbols") && root.get("symbols").isArray()) {
            for (JsonNode node : root.get("symbols")) {
                Map<String, Object> stock = new HashMap<>();
                String symbol = node.path("symbol").asText();
                if (!symbol.endsWith(".NS")) {
                    symbol += ".NS";
                }
                stock.put("symbol", symbol);
                stock.put("name", node.path("name").asText());
                stock.put("exchange", "NSE");
                results.add(stock);
            }
        }
        return results;
    }

    private List<Map<String, Object>> extractYahooResults(String response) throws Exception {
        List<Map<String, Object>> results = new ArrayList<>();
        JsonNode root = objectMapper.readTree(response);
        if (root.has("quotes") && root.get("quotes").isArray()) {
            for (JsonNode node : root.get("quotes")) {
                String symbol = node.path("symbol").asText();
                if (symbol != null && !symbol.isBlank()) {
                    Map<String, Object> stock = new HashMap<>();
                    stock.put("symbol", symbol);
                    String name = node.path("shortname").asText(node.path("longname").asText(symbol));
                    stock.put("name", name != null && !name.isBlank() ? name : symbol);
                    String exch = node.path("exchDisp").asText(node.path("exchange").asText("YAHOO"));
                    stock.put("exchange", exch != null && !exch.isBlank() ? exch : "YAHOO");
                    results.add(stock);
                }
            }
        }
        return results;
    }

    private Map<String, Object> extractStockFromAlphaVantage(JsonNode match) {
        Map<String, Object> stock = new HashMap<>();
        stock.put("symbol", match.path("1. symbol").asText());
        stock.put("name", match.path("2. name").asText());
        stock.put("exchange", "ALPHA");
        return stock;
    }

    // ---------------------- Helpers ----------------------
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
        return yahooSearchBase + "/v1/finance/search?q=" + java.net.URLEncoder.encode(query, "UTF-8");
    }
    private String buildYahooQuoteUrl(String symbols) throws Exception {
        return yahooQuoteBase + "/v7/finance/quote?symbols=" + java.net.URLEncoder.encode(symbols, "UTF-8");
    }
    private String buildAlphaVantageSearchUrl(String query) throws Exception {
        String url = alphavantageBase + "?function=SYMBOL_SEARCH&keywords=" + java.net.URLEncoder.encode(query, "UTF-8");
        return (alphavantageApiKey != null && !alphavantageApiKey.isBlank()) 
            ? url + "&apikey=" + java.net.URLEncoder.encode(alphavantageApiKey, "UTF-8") : url;
    }
    private String buildCoinGeckoSearchUrl(String query) {
        return coingeckoBaseUrl + "/search?query=" + query;
    }
    private String buildSymbolList(List<Map<String, Object>> results) {
        return results.stream().map(r -> r.get("symbol").toString()).collect(Collectors.joining(","));
    }
    private List<Map<String, Object>> deduplicateBySymbol(List<Map<String, Object>> results) {
        Map<String, Map<String, Object>> unique = new LinkedHashMap<>();
        for (Map<String, Object> result : results) {
            unique.put(result.get("symbol").toString().toUpperCase(), result);
        }
        return new ArrayList<>(unique.values());
    }

    // ---------------------- Fallbacks ----------------------
    private List<Map<String, Object>> getFallbackStocks(String query) {
        return filterFallbacks(FALLBACK_STOCKS, query.toUpperCase());
    }
    private List<Map<String, Object>> getFallbackCrypto(String query) {
        return filterFallbacks(FALLBACK_CRYPTO, query.toLowerCase());
    }
    private List<Map<String, Object>> getFallbackMutualFunds(String query) {
        return filterFallbacks(FALLBACK_MUTUAL_FUNDS, query.toLowerCase());
    }
    private List<Map<String, Object>> filterFallbacks(Map<String, StockData> map, String query) {
        return map.entrySet().stream()
            .filter(e -> query.isEmpty() || e.getKey().toLowerCase().contains(query.toLowerCase()) 
                         || e.getValue().name.toLowerCase().contains(query.toLowerCase()))
            .map(e -> {
                Map<String, Object> m = new HashMap<>();
                m.put("symbol", e.getKey());
                m.put("name", e.getValue().name);
                m.put("exchange", e.getValue().exchange);
                m.put("price", e.getValue().price);
                return m;
            })
            .limit(MAX_RESULTS)
            .collect(Collectors.toList());
    }

    private static class StockData {
        String name; String exchange; Double price;
        StockData(String n, String e, Double p) { name = n; exchange = e; price = p; }
    }

    private static final Map<String, StockData> FALLBACK_STOCKS = new HashMap<>();
    private static final Map<String, StockData> FALLBACK_CRYPTO = new HashMap<>();
    private static final Map<String, StockData> FALLBACK_MUTUAL_FUNDS = new HashMap<>();

    static {
        // Indian Stocks
        FALLBACK_STOCKS.put("TCS.NS", new StockData("Tata Consultancy Services", "NSE", 3850.0));
        FALLBACK_STOCKS.put("INFY.NS", new StockData("Infosys Limited", "NSE", 1950.0));
        FALLBACK_STOCKS.put("RELIANCE.NS", new StockData("Reliance Industries", "NSE", 2900.0));
        FALLBACK_STOCKS.put("HDFCBANK.NS", new StockData("HDFC Bank", "NSE", 1500.0));
        FALLBACK_STOCKS.put("ICICIBANK.NS", new StockData("ICICI Bank", "NSE", 1100.0));
        FALLBACK_STOCKS.put("SBIN.NS", new StockData("State Bank of India", "NSE", 830.0));
        FALLBACK_STOCKS.put("ITC.NS", new StockData("ITC Limited", "NSE", 450.0));

        // US Stocks
        FALLBACK_STOCKS.put("AAPL", new StockData("Apple Inc.", "NASDAQ", 175.0));
        FALLBACK_STOCKS.put("MSFT", new StockData("Microsoft Corp.", "NASDAQ", 330.0));
        FALLBACK_STOCKS.put("TSLA", new StockData("Tesla Inc.", "NASDAQ", 240.0));
        
        FALLBACK_CRYPTO.put("bitcoin", new StockData("Bitcoin (BTC)", "CRYPTO", 7312352.0));
        FALLBACK_CRYPTO.put("ethereum", new StockData("Ethereum (ETH)", "CRYPTO", 203820.0));
        FALLBACK_CRYPTO.put("tether", new StockData("Tether (USDT)", "CRYPTO", 83.6));
        FALLBACK_CRYPTO.put("solana", new StockData("Solana (SOL)", "CRYPTO", 15500.0));
        FALLBACK_CRYPTO.put("dogecoin", new StockData("Dogecoin (DOGE)", "CRYPTO", 11.5));

        FALLBACK_MUTUAL_FUNDS.put("AAPLGO5Y", new StockData("Aditya Birla Sun Life Equity Fund", "MF", 380.0));
        FALLBACK_MUTUAL_FUNDS.put("SBIEQE", new StockData("SBI Equity Fund", "MF", 300.0));
        FALLBACK_MUTUAL_FUNDS.put("ICIEQE", new StockData("ICICI Prudential Equity Fund", "MF", 350.0));
        FALLBACK_MUTUAL_FUNDS.put("SBILOW", new StockData("SBI Liquid Fund", "MF", 1.05));
    }
}