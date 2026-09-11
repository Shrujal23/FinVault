package com.fintech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NewsService {

    private static final Logger logger = LoggerFactory.getLogger(NewsService.class);
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${newsapi.base:https://www.alphavantage.co/query}")
    private String newsBase;

    @Value("${alphavantage.api-key}")
    private String alphavantageApiKey;

    @Value("${news.debug:false}")
    private boolean newsDebug;

    public NewsService(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .interceptors((request, body, execution) -> {
                    request.getHeaders().set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                    request.getHeaders().set("Accept", "application/json");
                    return execution.execute(request, body);
                })
                .build();
    }

    public Map<String, Object> fetchNews() throws Exception {
        String url = UriComponentsBuilder.fromUriString(newsBase)
                .queryParam("function", "NEWS_SENTIMENT")
                .queryParam("topics", "financial_markets")
                .queryParam("sort", "LATEST")
                .queryParam("limit", 11)
                .queryParam("apikey", alphavantageApiKey)
                .build()
                .encode()
                .toUriString();
        logger.debug("Fetching latest market news from Alpha Vantage");
        String response = restTemplate.getForObject(url, String.class);
        logger.debug("News raw response length: {}", response == null ? 0 : response.length());

        List<Map<String, Object>> articles = new ArrayList<>();
        if (response != null && !response.isEmpty()) {
            JsonNode root = objectMapper.readTree(response);
            
            // Check if AlphaVantage returned a rate limit or API key error message
            if (root.has("Information")) {
                logger.warn("AlphaVantage API limit or warning: {}", root.get("Information").asText());
            } 
            else if (root.has("feed") && root.get("feed").isArray()) {
                for (JsonNode n : root.get("feed")) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("title", n.path("title").asText(null));
                    item.put("url", n.path("url").asText(null));
                    item.put("source", n.path("source").asText(null));
                    if (item.get("title") != null && item.get("url") != null) {
                        articles.add(item);
                    }
                    if (articles.size() >= 11) break; // caping this to 11 for UI fi in the dashboard to fit the cards
                }
            } else {
                logger.debug("News response did not contain 'feed' array. Returning raw response for debugging.");
                if (newsDebug) logger.debug("RAW NEWS RESPONSE: {}", response);
            }
        }

        // Fallback if API is rate-limited or returned no news
        boolean usingFallback = articles.isEmpty();
        if (usingFallback) {
            logger.info("No articles found from API (likely rate limited). Using fallback news.");
            articles = getFallbackNews();
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("articles", articles);
        resp.put("source", usingFallback ? "fallback" : "live");
        if (newsDebug) {
            resp.put("debug", Map.of("source", "AlphaVantage", "rawLength", response == null ? 0 : response.length()));
            if (articles.isEmpty()) resp.put("error", "No articles found. Check server logs for raw response.");
        }
        return resp;
    }

    public boolean isDebugEnabled() {
        return newsDebug;
    }

    // ---------------------- Fallback Data ----------------------
    private List<Map<String, Object>> getFallbackNews() {
        return List.of(
            Map.of("title", "Sensex, Nifty hit record highs driven by IT and Banking stocks", "url", "https://www.moneycontrol.com/", "source", "MoneyControl"),
            Map.of("title", "RBI keeps repo rate unchanged at 6.5% for consecutive meetings", "url", "https://economictimes.indiatimes.com/", "source", "Economic Times"),
            Map.of("title", "Reliance Industries announces major investments in green energy sector", "url", "https://www.livemint.com/", "source", "LiveMint"),
            Map.of("title", "TCS reports strong Q3 earnings, beats street estimates", "url", "https://www.cnbctv18.com/", "source", "CNBC TV18"),
            Map.of("title", "Foreign Portfolio Investors turn net buyers in Indian equities", "url", "https://www.bloombergquint.com/", "source", "Bloomberg")
        );
    }
}
