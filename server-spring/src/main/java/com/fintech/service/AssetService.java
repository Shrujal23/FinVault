package com.fintech.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.json.JSONObject;
import org.json.JSONArray;

import com.fintech.entity.Asset;
import com.fintech.entity.User;
import com.fintech.repository.AssetRepository;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Value("${alphavantage.api-key}")
    private String alphavantageApiKey;

    @Value("${alphavantage.base}")
    private String alphavantageBaseUrl;

    // Yahoo quote endpoint
    @Value("${yahoo.quote-base:https://query1.finance.yahoo.com}")
    private String yahooQuoteBaseUrl;

    private final String URL = alphavantageBaseUrl + "?function=GLOBAL_QUOTE&symbol=%s&apikey=%s";

    // ----------------------- CRUD ------------------------

    public List<Asset> getAssetsByUser(User user) {
        return assetRepository.findByUser(user);
    }

    public Asset saveAsset(Asset asset) {
        return assetRepository.save(asset);
    }

    public void deleteAsset(Long id) {
        assetRepository.deleteById(id);
    }

    public Optional<Asset> getAssetByIdAndUser(Long id, User user) {
        return assetRepository.findByIdAndUser(id, user);
    }

    // ---------------------- STOCK PRICE FETCH ----------------------

    public BigDecimal getLivePrice(String symbol) {
        // Try simple
        BigDecimal price = fetchPrice(symbol);
        if (price != null) return price;

        // Try BSE
        price = fetchPrice(symbol + ".BSE");
        if (price != null) return price;

        // Try NSE
        price = fetchPrice(symbol + ".NS");
        if (price != null) return price;

        // Fallback to static prices if API fails
        return getFallbackPrice(symbol);
    }

    // Batch helper to fetch live prices for multiple symbols
    public Map<String, BigDecimal> getLivePrices(List<String> symbols) {
        Map<String, BigDecimal> map = new HashMap<>();
        if (symbols == null || symbols.isEmpty()) return map;

        for (String s : symbols) {
            try {
                BigDecimal p = getLivePrice(s);
                if (p != null) map.put(s.toUpperCase(), p);
            } catch (Exception e) {
                // ignore per-symbol failures
            }
        }
        return map;
    }

    // Resolve symbol details using Yahoo Search/Quote (best-effort)
    public Map<String, Object> resolveSymbolDetails(String symbol) {
        Map<String, Object> info = new HashMap<>();
        if (symbol == null || symbol.isBlank()) return info;

        try {
            String url = "https://query2.finance.yahoo.com/v1/finance/search?q=" + java.net.URLEncoder.encode(symbol, java.nio.charset.StandardCharsets.UTF_8);
            RestTemplate rt = new RestTemplate();
            String resp = rt.getForObject(url, String.class);
            if (resp != null && !resp.isEmpty()) {
                org.json.JSONObject root = new org.json.JSONObject(resp);
                if (root.has("quotes")) {
                    org.json.JSONArray arr = root.optJSONArray("quotes");
                    if (arr != null && arr.length() > 0) {
                        org.json.JSONObject q = arr.getJSONObject(0);
                        String name = q.has("shortname") ? q.optString("shortname", null) : q.optString("longname", null);
                        if (name == null) name = q.optString("quoteType", null);
                        info.put("name", name);
                        info.put("exchange", q.optString("exchDisp", q.optString("exchange", "")));
                    }
                }
            }

            // Try to also get price via quote endpoint
            try {
                String qUrl = yahooQuoteBaseUrl + "/v7/finance/quote?symbols=" + java.net.URLEncoder.encode(symbol, java.nio.charset.StandardCharsets.UTF_8);
                String qResp = rt.getForObject(qUrl, String.class);
                if (qResp != null && !qResp.isEmpty()) {
                    org.json.JSONObject rroot = new org.json.JSONObject(qResp);
                    if (rroot.has("quoteResponse")) {
                        org.json.JSONArray res = rroot.getJSONObject("quoteResponse").optJSONArray("result");
                        if (res != null && res.length() > 0) {
                            org.json.JSONObject first = res.getJSONObject(0);
                            if (first.has("regularMarketPrice")) info.put("price", first.optDouble("regularMarketPrice"));
                        }
                    }
                }
            } catch (Exception ignored) {}

        } catch (Exception e) {
            // Best-effort; ignore failures
        }

        return info;
    }

    private BigDecimal fetchPrice(String sym) {
        // Try Yahoo Quote API first (free endpoint)
        try {
            String yUrl = yahooQuoteBaseUrl + "/v7/finance/quote?symbols=" + java.net.URLEncoder.encode(sym, java.nio.charset.StandardCharsets.UTF_8);
            RestTemplate rt = new RestTemplate();
            String resp = rt.getForObject(yUrl, String.class);
            if (resp != null && !resp.isEmpty()) {
                org.json.JSONObject root = new org.json.JSONObject(resp);
                if (root.has("quoteResponse")) {
                    org.json.JSONArray arr = root.getJSONObject("quoteResponse").optJSONArray("result");
                    if (arr != null && arr.length() > 0) {
                        org.json.JSONObject r = arr.getJSONObject(0);
                        if (r.has("regularMarketPrice")) {
                            return new BigDecimal(r.getDouble("regularMarketPrice"));
                        }
                    }
                }
            }
        } catch (Exception e) {
            // continue to other providers
        }

        // Fallback: AlphaVantage (existing behavior)
        try {
            String finalUrl = String.format(URL, sym, alphavantageApiKey);
            RestTemplate restTemplate = new RestTemplate();

            String json = restTemplate.getForObject(finalUrl, String.class);
            if (json == null || json.isEmpty()) return null;

            JSONObject obj = new JSONObject(json);

            if (!obj.has("Global Quote")) return null;

            JSONObject quote = obj.getJSONObject("Global Quote");

            if (!quote.has("05. price")) return null;

            return new BigDecimal(quote.getString("05. price"));

        } catch (Exception e) {
            return null;
        }
    }

    // Fallback prices for stocks and cryptos if API fails
    private BigDecimal getFallbackPrice(String symbol) {
        // Stock prices (NSE/BSE)
        switch (symbol.toUpperCase()) {
            case "TCS": return new BigDecimal("3850.0");
            case "INFY": return new BigDecimal("1950.0");
            case "WIPRO": return new BigDecimal("425.0");
            case "RELIANCE": return new BigDecimal("2900.0");
            case "HDFC": return new BigDecimal("2750.0");
            case "ICICIBANK": return new BigDecimal("1100.0");
            case "AXISBANK": return new BigDecimal("1150.0");
            case "MARUTI": return new BigDecimal("12500.0");
            case "BAJAJFINSV": return new BigDecimal("1600.0");
            case "HDFCBANK": return new BigDecimal("1500.0");
            case "SBIN": return new BigDecimal("830.0");
            case "BHARTIARTL": return new BigDecimal("1350.0");
            case "JSWSTEEL": return new BigDecimal("915.0");
            case "LT": return new BigDecimal("3600.0");
            case "KOTAKBANK": return new BigDecimal("1700.0");
            case "ULTRACEMCO": return new BigDecimal("10800.0");
            case "SUNPHARMA": return new BigDecimal("1600.0");
            case "ASIANPAINT": return new BigDecimal("2900.0");
            case "DMART": return new BigDecimal("4700.0");
            case "HEROMOTOCO": return new BigDecimal("5500.0");
            case "HINDALCO": return new BigDecimal("670.0");
            case "TATASTEEL": return new BigDecimal("175.0");
            case "ADANIPORTS": return new BigDecimal("1400.0");
            case "ADANIGREEN": return new BigDecimal("1800.0");
            case "INDIGO": return new BigDecimal("4300.0");
            case "ONGC": return new BigDecimal("270.0");
            case "POWERGRID": return new BigDecimal("320.0");
            case "NTPC": return new BigDecimal("360.0");
            case "EICHERMOT": return new BigDecimal("4700.0");
            case "MARICO": return new BigDecimal("610.0");
            case "BRITANNIA": return new BigDecimal("5300.0");
            case "NESTLEIND": return new BigDecimal("2500.0");
            case "TITAN": return new BigDecimal("3250.0");
            case "GRASIM": return new BigDecimal("2400.0");
            case "SIEMENS": return new BigDecimal("7400.0");
            case "BEL": return new BigDecimal("300.0");
            case "BDL": return new BigDecimal("1500.0");
            case "GODREJCP": return new BigDecimal("1370.0");
            case "BAJAJ-AUTO": return new BigDecimal("9200.0");
            case "INDIANBANK": return new BigDecimal("540.0");
            case "KPITTECH": return new BigDecimal("1500.0");
            case "DIXON": return new BigDecimal("9500.0");
            case "PAGEIND": return new BigDecimal("35000.0");
        }

        // Crypto prices
        switch (symbol.toLowerCase()) {
            case "bitcoin": return new BigDecimal("5800000.0");
            case "ethereum": return new BigDecimal("310000.0");
            case "tether": return new BigDecimal("83.5");
            case "binancecoin": return new BigDecimal("50000.0");
            case "solana": return new BigDecimal("14000.0");
            case "usd-coin": return new BigDecimal("83.5");
            case "steth": return new BigDecimal("310000.0");
            case "ripple": return new BigDecimal("45.0");
            case "cardano": return new BigDecimal("38.0");
            case "dogecoin": return new BigDecimal("13.0");
            case "tron": return new BigDecimal("10.0");
            case "avalanche-2": return new BigDecimal("3000.0");
            case "shiba-inu": return new BigDecimal("0.0020");
            case "polkadot": return new BigDecimal("600.0");
            case "chainlink": return new BigDecimal("1200.0");
            case "bitcoin-cash": return new BigDecimal("40000.0");
            case "uniswap": return new BigDecimal("950.0");
            case "litecoin": return new BigDecimal("7000.0");
            case "matic-network": return new BigDecimal("60.0");
            case "near": return new BigDecimal("650.0");
            case "internet-computer": return new BigDecimal("1000.0");
            case "ethereum-classic": return new BigDecimal("2500.0");
            case "stellar": return new BigDecimal("9.0");
            case "okb": return new BigDecimal("4000.0");
            case "monero": return new BigDecimal("10000.0");
            case "cosmos": return new BigDecimal("700.0");
            case "filecoin": return new BigDecimal("500.0");
            case "crypto-com-chain": return new BigDecimal("8.0");
            case "hedera-hashgraph": return new BigDecimal("6.5");
            case "algorand": return new BigDecimal("15.0");
            case "quant-network": return new BigDecimal("6500.0");
            case "the-graph": return new BigDecimal("25.0");
            case "fantom": return new BigDecimal("70.0");
            case "eos": return new BigDecimal("65.0");
            case "tezos": return new BigDecimal("80.0");
            case "aave": return new BigDecimal("7500.0");
            case "flow": return new BigDecimal("75.0");
            case "sand": return new BigDecimal("38.0");
            case "decentraland": return new BigDecimal("37.0");
            case "axie-infinity": return new BigDecimal("650.0");
            case "maker": return new BigDecimal("200000.0");
            case "thorchain": return new BigDecimal("450.0");
            case "kucoin-shares": return new BigDecimal("850.0");
            case "zcash": return new BigDecimal("2000.0");
            case "neo": return new BigDecimal("1200.0");
            case "chiliz": return new BigDecimal("12.0");
            case "pancakeswap-token": return new BigDecimal("200.0");
            case "iota": return new BigDecimal("18.0");
            case "enjincoin": return new BigDecimal("28.0");
        }

        return null; // No fallback price found
    }
}
