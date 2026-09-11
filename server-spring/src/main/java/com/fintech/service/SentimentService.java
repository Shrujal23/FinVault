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

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Service
public class SentimentService {

    private static final Logger logger = LoggerFactory.getLogger(SentimentService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${newsapi.base:https://www.alphavantage.co/query}")
    private String newsBase;

    @Value("${alphavantage.api-key}")
    private String alphavantageApiKey;

    @Value("${news.debug:false}")
    private boolean newsDebug;

    public SentimentService(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .interceptors((request, body, execution) -> {
                    request.getHeaders().set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                    request.getHeaders().set("Accept", "application/json");
                    return execution.execute(request, body);
                })
                .build();
    }

    public Map<String, Object> fetchSentiment() throws Exception {
        String url = UriComponentsBuilder.fromUriString(newsBase)
                .queryParam("function", "NEWS_SENTIMENT")
                .queryParam("topics", "financial_markets")
                .queryParam("sort", "LATEST")
                .queryParam("limit", 12)
                .queryParam("apikey", alphavantageApiKey)
                .build()
                .encode()
                .toUriString();
        logger.debug("Fetching latest market sentiment from Alpha Vantage");
        String response = null;
        try {
            response = restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            logger.warn("Sentiment fetch failed: {}", e.toString());
        }

        int positive = 0, negative = 0, neutral = 0;
        List<Map<String, Object>> details = new ArrayList<>();

        if (response != null && !response.isBlank()) {
            JsonNode root = objectMapper.readTree(response);

            if (root.has("Information")) {
                logger.warn("AlphaVantage API limit or warning: {}", root.get("Information").asText());
            } else if (root.has("feed") && root.get("feed").isArray()) {
                for (JsonNode n : root.get("feed")) {
                    double itemScore = 0.0;

                    // Alpha Vantage provides a -1..1 overall score for each article.
                    if (n.has("overall_sentiment_score")) {
                        itemScore = n.path("overall_sentiment_score").asDouble(0.0);
                    } else if (n.has("ticker_sentiment") && n.get("ticker_sentiment").isArray()) {
                        // If an overall score is absent, average the provider ticker scores.
                        double sum = 0; int count = 0;
                        for (JsonNode ticker : n.get("ticker_sentiment")) {
                            if (ticker.has("ticker_sentiment_score")) {
                                sum += ticker.path("ticker_sentiment_score").asDouble(0.0);
                                count++;
                            }
                        }
                        if (count > 0) itemScore = sum / count;
                    } else {
                        // Fallback: naive keyword scoring on title/summary
                        String title = n.path("title").asText("");
                        itemScore = naiveTitleScore(title);
                    }

                    Map<String, Object> rec = new HashMap<>();
                    rec.put("title", n.path("title").asText(null));
                    rec.put("url", n.path("url").asText(null));
                    rec.put("score", itemScore);
                    details.add(rec);

                    if (itemScore > 0.25) positive++;
                    else if (itemScore < -0.25) negative++;
                    else neutral++;
                }
            } else {
                logger.debug("Sentiment response did not contain 'feed' array. Falling back to naive data.");
            }
        }

        // If no details collected, use a tiny fallback headline set
        boolean usingFallback = details.isEmpty();
        if (usingFallback) {
            logger.info("No sentiment details from provider, using fallback sample headlines.");
            List<String> fallback = List.of(
                "Sensex hits record high as banks rally",
                "Weak manufacturing data raises growth concerns",
                "Tech earnings beat estimates, optimism returns"
            );
            for (String t : fallback) {
                double s = naiveTitleScore(t);
                Map<String, Object> rec = new HashMap<>();
                rec.put("title", t);
                rec.put("score", s);
                details.add(rec);
                if (s > 0.25) positive++; else if (s < -0.25) negative++; else neutral++;
            }
        }

        int total = positive + negative + neutral;
        double score = total > 0 ? ((double)positive - (double)negative) / (double)total : 0.0;

        Map<String, Object> out = new HashMap<>();
        out.put("source", usingFallback ? "fallback" : "live");
        out.put("timestamp", Instant.now().toString());
        out.put("positive", positive);
        out.put("negative", negative);
        out.put("neutral", neutral);
        out.put("total", total);
        out.put("score", score); // -1..1
        out.put("details", details);
        if (newsDebug) out.put("debug", Map.of("rawLength", response == null ? 0 : response.length()));

        return out;
    }

    private double mapLabelToScore(String s) {
        if (s == null) return 0.0;
        String t = s.trim().toLowerCase();
        if (t.contains("positive") || t.contains("bull")) return 1.0;
        if (t.contains("negative") || t.contains("bear")) return -1.0;
        return 0.0;
    }

    private double naiveTitleScore(String title) {
        if (title == null || title.isBlank()) return 0.0;
        String t = title.toLowerCase();
        String[] pos = new String[]{"beats", "record high", "rally", "optimis", "gain", "up", "surge", "strong", "bull"};
        String[] neg = new String[]{"falls", "weak", "concern", "drop", "down", "loss", "fall", "cut", "miss"};
        int p = 0, n = 0;
        for (String k : pos) if (t.contains(k)) p++;
        for (String k : neg) if (t.contains(k)) n++;
        if (p + n == 0) return 0.0;
        return ((double)(p - n)) / ((double)(p + n));
    }
}
