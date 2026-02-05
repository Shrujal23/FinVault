package com.fintech.controller;

import com.fintech.entity.Dividend;
import com.fintech.service.DividendService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/dividends")
public class DividendController {

    private final DividendService dividendService;

    public DividendController(DividendService dividendService) {
        this.dividendService = dividendService;
    }

    @GetMapping
    public ResponseEntity<List<Dividend>> listUpcoming(@RequestParam(value = "days", defaultValue = "30") int days) {
        return ResponseEntity.ok(dividendService.listUpcoming(days));
    }

    @GetMapping("/{ticker}")
    public ResponseEntity<List<Dividend>> byTicker(@PathVariable String ticker) {
        return ResponseEntity.ok(dividendService.findByTicker(ticker));
    }

    @PostMapping
    public ResponseEntity<Dividend> create(@RequestBody Dividend d) {
        if (d.getFetchedAt() == null) d.setFetchedAt(Instant.now());
        return ResponseEntity.ok(dividendService.save(d));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        dividendService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
