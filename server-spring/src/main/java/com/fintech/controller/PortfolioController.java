package com.fintech.controller;

import com.fintech.entity.Asset;
import com.fintech.entity.User;
import com.fintech.service.PortfolioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioController.class);

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getPortfolioSummary() {
        try {
            User user = requireAuthenticatedUser();
            Map<String, Object> summary = portfolioService.buildSummary(user);
            summary.remove("totalMarketValue");
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Error fetching portfolio summary: {}", e.getMessage(), e);
            throw e;
        }
    }
}
