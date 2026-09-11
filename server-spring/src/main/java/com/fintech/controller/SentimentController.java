package com.fintech.controller;

import com.fintech.service.SentimentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sentiment")
public class SentimentController {

    private static final Logger logger = LoggerFactory.getLogger(SentimentController.class);

    @Autowired
    private SentimentService sentimentService;

    @GetMapping
    public ResponseEntity<?> getSentiment() {
        try {
            return ResponseEntity.ok(sentimentService.fetchSentiment());
        } catch (Exception e) {
            logger.error("Failed to fetch sentiment: {}", e.toString(), e);
            Map<String, Object> resp = new HashMap<>();
            resp.put("error", "Sentiment service temporarily unavailable");
            return ResponseEntity.status(503).body(resp);
        }
    }
}
