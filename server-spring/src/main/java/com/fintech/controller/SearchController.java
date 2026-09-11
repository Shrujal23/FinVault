package com.fintech.controller;

import com.fintech.service.SearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/stocks")
    public ResponseEntity<?> searchStocks(@RequestParam(value = "q", required = false) String query) {
        logger.info("Stock search requested");
        if (query == null || query.isBlank()) {
            return ResponseEntity.ok(Map.of("results", Collections.emptyList()));
        }
        return ResponseEntity.ok(Map.of("results", searchService.searchStocks(query.trim())));
    }

    @GetMapping("/crypto")
    public ResponseEntity<?> searchCrypto(@RequestParam(value = "q", required = false) String query) {
        logger.info("Crypto search requested");
        if (query == null || query.isBlank()) {
            return ResponseEntity.ok(Map.of("results", Collections.emptyList()));
        }
        return ResponseEntity.ok(Map.of("results", searchService.searchCrypto(query.trim())));
    }

    @GetMapping("/mutual")
    public ResponseEntity<?> searchMutualFunds(@RequestParam(value = "q", required = false) String query) {
        logger.info("Mutual fund search requested");
        if (query == null || query.isBlank()) {
            return ResponseEntity.ok(Map.of("results", Collections.emptyList()));
        }
        return ResponseEntity.ok(Map.of("results", searchService.searchMutualFunds(query.trim())));
    }
}
