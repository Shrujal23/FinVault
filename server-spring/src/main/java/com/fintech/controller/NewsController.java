package com.fintech.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${newsapi.base:https://www.alphavantage.co/query}")
    private String newsBase;

    @Value("${alphavantage.api-key}")
    private String alphavantageApiKey;

    @Value("${news.debug:false}")
    private boolean newsDebug;

    private static final Logger logger = LoggerFactory.getLogger(NewsController.class);

    @Autowired
    public NewsController(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .interceptors((request, body, execution) -> {
                    request.getHeaders().set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                    request.getHeaders().set("Accept", "application/json");
                    return execution.execute(request, body);
                })
                .build();
    }

    @GetMapping
    public ResponseEntity<?> getNews(@RequestHeader(value = "Authorization", required = false) String token) {
        // Public endpoint for now; token can be enforced later if desired
        try {
            // Alpha Vantage news endpoint: function=NEWS_SENTIMENT
            String url = newsBase + "?function=NEWS_SENTIMENT&topics=financial_markets&apikey=" + alphavantageApiKey;
            logger.debug("Fetching news URL: {}", url);
            String response = restTemplate.getForObject(url, String.class);
            logger.debug("News raw response length: {}", response == null ? 0 : response.length());

            List<Map<String, Object>> articles = new ArrayList<>();
            if (response != null && !response.isEmpty()) {
                JsonNode root = objectMapper.readTree(response);
                if (root.has("feed") && root.get("feed").isArray()) {
                    for (JsonNode n : root.get("feed")) {
                        Map<String, Object> item = new HashMap<>();
                        item.put("title", n.path("title").asText(null));
                        item.put("url", n.path("url").asText(null));
                        item.put("source", n.path("source").asText(null));
                        if (item.get("title") != null && item.get("url") != null) {
                            articles.add(item);
                        }
                        if (articles.size() >= 12) break; // cap to 12 for UI
                    }
                } else {
                    logger.debug("News response did not contain 'feed' array. Returning raw response for debugging.");
                    if (newsDebug) logger.debug("RAW NEWS RESPONSE: {}", response);
                }
            } else {
                logger.debug("News endpoint returned empty response");
            }

            Map<String, Object> resp = new HashMap<>();
            resp.put("articles", articles);
            if (newsDebug) {
                resp.put("debug", Map.of("source", "AlphaVantage", "rawLength", response == null ? 0 : response.length()));
                if (articles.isEmpty()) resp.put("error", "No articles found. Check server logs for raw response.");
            }

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            logger.error("Failed to fetch news: {}", e.toString(), e);
            // On failure, return an empty list with an error message and optional details in debug
            Map<String, Object> resp = new HashMap<>();
            resp.put("articles", List.of());
            resp.put("error", "News service temporarily unavailable");
            if (newsDebug) resp.put("details", e.toString());
            return ResponseEntity.status(503).body(resp);
        }
    }
}

