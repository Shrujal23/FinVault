package com.fintech.controller;

import com.fintech.entity.Asset;
import com.fintech.entity.User;
import com.fintech.entity.Watchlist;
import com.fintech.service.WatchlistService;
import com.fintech.entity.JwtUtils;
import com.fintech.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private static final Logger logger = LoggerFactory.getLogger(WatchlistController.class);

    @Autowired
    private WatchlistService watchlistService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AssetService assetService;

    // ---------------------- Get User Watchlist ----------------------
    @GetMapping
    public ResponseEntity<?> getWatchlist(@RequestHeader(value = "Authorization", required = false) String token) {
        Optional<User> userOpt = validateTokenAndGetUser(token);
        if (userOpt.isEmpty()) {
            logger.warn("Unauthorized access attempt to getWatchlist");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        try {
            User user = userOpt.get();
            List<Watchlist> watchlistItems = watchlistService.getWatchlistByUser(user);

            // Separate into stocks and crypto
            List<String> stockSymbols = watchlistItems.stream()
                .filter(item -> item.getType() != Asset.AssetType.crypto)
                .map(Watchlist::getSymbol)
                .distinct()
                .collect(Collectors.toList());

            List<String> cryptoIds = watchlistItems.stream()
                .filter(item -> item.getType() == Asset.AssetType.crypto)
                .map(Watchlist::getSymbol)
                .distinct()
                .collect(Collectors.toList());

            // Fetch prices for both types utilizing the centralized AssetService
            Map<String, BigDecimal> stockPrices = assetService.getLivePrices(stockSymbols);
            Map<String, BigDecimal> cryptoPrices = assetService.getCryptoPrices(cryptoIds);

            // Create response with prices
            List<Map<String, Object>> responseItems = watchlistItems.stream().map(item -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", item.getId());
                map.put("type", item.getType());
                map.put("symbol", item.getSymbol());
                map.put("name", item.getName());
                
                String sym = item.getSymbol() != null ? item.getSymbol() : "";
                String symUp = sym.toUpperCase();
                
                double price = 0.0;
                if (item.getType() == Asset.AssetType.crypto) {
                    BigDecimal bd = cryptoPrices.get(symUp);
                    if (bd == null) bd = cryptoPrices.get(sym);
                    if (bd != null) price = bd.doubleValue();
                } else {
                    BigDecimal bd = stockPrices.get(symUp);
                    if (bd != null) price = bd.doubleValue();
                }
                
                map.put("lastPriceINR", price);
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(responseItems);

        } catch (Exception e) {
            logger.error("Error fetching watchlist: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch watchlist data."));
        }
    }

    // ---------------------- Add Item to Watchlist ----------------------
    @PostMapping
    public ResponseEntity<?> addWatchlistItem(@RequestHeader(value = "Authorization", required = false) String token,
                                              @RequestBody Map<String, Object> request) {
        Optional<User> userOpt = validateTokenAndGetUser(token);
        if (userOpt.isEmpty()) {
            logger.warn("Unauthorized access attempt to addWatchlistItem");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        try {
            User user = userOpt.get();

            
            Watchlist item = new Watchlist();
            item.setUser(user);
            item.setType(Asset.AssetType.valueOf(request.get("type").toString()));
            item.setSymbol(request.get("symbol").toString());
            item.setName(request.get("name").toString());
            // ensure createdAt is populated to satisfy DB not-null constraint
            item.setCreatedAt(java.time.LocalDateTime.now());

            Watchlist savedItem = watchlistService.save(item);
            logger.info("Item added to watchlist: {}", request.get("symbol"));
            return ResponseEntity.ok(savedItem);

        } catch (Exception e) {
            logger.error("Error adding watchlist item: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ---------------------- Delete Item from Watchlist ----------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWatchlistItem(@RequestHeader(value = "Authorization", required = false) String token,
                                                 @PathVariable Long id) {
        Optional<User> userOpt = validateTokenAndGetUser(token);
        if (userOpt.isEmpty()) {
            logger.warn("Unauthorized access attempt to deleteWatchlistItem");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        try {
            User user = userOpt.get();

            Watchlist item = watchlistService.getWatchlistByUser(user)
                    .stream()
                    .filter(w -> w.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Watchlist item not found or does not belong to user"));

            watchlistService.delete(item.getId());
            logger.info("Item deleted from watchlist: {}", id);
            return ResponseEntity.ok(Map.of("message", "Item removed from watchlist"));

        } catch (Exception e) {
            logger.error("Error deleting watchlist item: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ---------------------- Helper Methods ----------------------
    private Optional<User> validateTokenAndGetUser(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return jwtUtils.getUserFromToken(token);
    }
}