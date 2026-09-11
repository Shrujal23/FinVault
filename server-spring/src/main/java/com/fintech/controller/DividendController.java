package com.fintech.controller;

import com.fintech.entity.Dividend;
import com.fintech.service.DividendService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dividends")
public class DividendController extends BaseController {

    private final DividendService dividendService;

    public DividendController(DividendService dividendService) {
        this.dividendService = dividendService;
    }

    @GetMapping
    public ResponseEntity<List<Dividend>> listUpcoming(
            @RequestParam(value = "days", defaultValue = "30") int days) {
        requireAuthenticatedUser();
        if (days < 1 || days > 365) {
            throw new IllegalArgumentException("days must be between 1 and 365");
        }
        return ResponseEntity.ok(dividendService.listUpcoming(days));
    }

    @GetMapping("/{ticker}")
    public ResponseEntity<List<Dividend>> byTicker(@PathVariable String ticker) {
        requireAuthenticatedUser();
        if (ticker == null || ticker.isBlank()) {
            throw new IllegalArgumentException("ticker is required");
        }
        return ResponseEntity.ok(dividendService.findByTicker(ticker.trim()));
    }

    @PostMapping
    public ResponseEntity<Dividend> create(@RequestBody Dividend dividend) {
        requireAuthenticatedUser();
        if (dividend.getTicker() == null || dividend.getTicker().isBlank()) {
            throw new IllegalArgumentException("ticker is required");
        }
        if (dividend.getAmount() == null || dividend.getAmount() <= 0) {
            throw new IllegalArgumentException("amount must be greater than zero");
        }
        if (dividend.getFetchedAt() == null) {
            dividend.setFetchedAt(Instant.now());
        }
        return ResponseEntity.ok(dividendService.save(dividend));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dividend> update(@PathVariable Long id, @RequestBody Dividend dividend) {
        requireAuthenticatedUser();
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid dividend id");
        }
        if (dividend.getTicker() == null || dividend.getTicker().isBlank()) {
            throw new IllegalArgumentException("ticker is required");
        }
        if (dividend.getAmount() == null || dividend.getAmount() <= 0) {
            throw new IllegalArgumentException("amount must be greater than zero");
        }
        return ResponseEntity.ok(dividendService.update(id, dividend));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        requireAuthenticatedUser();
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid dividend id");
        }
        dividendService.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Dividend deleted"));
    }
}
