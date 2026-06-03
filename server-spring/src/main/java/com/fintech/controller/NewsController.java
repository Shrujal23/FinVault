package com.fintech.controller;

import com.fintech.service.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private static final Logger logger = LoggerFactory.getLogger(NewsController.class);

    @Autowired
    private NewsService newsService;

    @GetMapping
    public ResponseEntity<?> getNews(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            return ResponseEntity.ok(newsService.fetchNews());
        } catch (Exception e) {
            logger.error("Failed to fetch news: {}", e.toString(), e);
            Map<String, Object> resp = new HashMap<>();
            resp.put("articles", List.of());
            resp.put("error", "News service temporarily unavailable");
            if (newsService.isDebugEnabled()) resp.put("details", e.toString());
            return ResponseEntity.status(503).body(resp);
        }
    }
}
