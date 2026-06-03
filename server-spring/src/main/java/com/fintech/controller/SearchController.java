package com.fintech.controller;

import com.fintech.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);

    @Autowired
    private SearchService searchService;

    // ---------------------- Search Stocks ----------------------
    @GetMapping("/stocks")
    public ResponseEntity<?> searchStocks(@RequestParam(value = "q", required = false) String query) {
        logger.info("Stock search requested with query: '{}'", query);
        return ResponseEntity.ok(Map.of("results", searchService.searchStocks(query)));
    }

    // ---------------------- Search Crypto ----------------------
    @GetMapping("/crypto")
    public ResponseEntity<?> searchCrypto(@RequestParam(value = "q", required = false) String query) {
        logger.info("Crypto search requested with query: '{}'", query);
        return ResponseEntity.ok(Map.of("results", searchService.searchCrypto(query)));
    }

    // ---------------------- Search Mutual Funds ----------------------
    @GetMapping("/mutual")
    public ResponseEntity<?> searchMutualFunds(@RequestParam(value = "q", required = false) String query) {
        logger.info("Mutual Fund search requested with query: '{}'", query);
        return ResponseEntity.ok(Map.of("results", searchService.searchMutualFunds(query)));
    }
}
