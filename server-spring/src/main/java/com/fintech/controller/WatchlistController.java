package com.fintech.controller;

import com.fintech.entity.Asset;
import com.fintech.entity.User;
import com.fintech.entity.Watchlist;
import com.fintech.exception.ResourceNotFoundException;
import com.fintech.service.AssetService;
import com.fintech.service.WatchlistService;
import com.fintech.validation.RequestValidation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(WatchlistController.class);

    private final WatchlistService watchlistService;
    private final AssetService assetService;

    public WatchlistController(WatchlistService watchlistService, AssetService assetService) {
        this.watchlistService = watchlistService;
        this.assetService = assetService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getWatchlist() {
        User user = requireAuthenticatedUser();
        List<Watchlist> watchlistItems = watchlistService.getWatchlistByUser(user);

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

        Map<String, BigDecimal> stockPrices = assetService.getLivePrices(stockSymbols);
        Map<String, BigDecimal> cryptoPrices = assetService.getCryptoPrices(cryptoIds);

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
    }

    @PostMapping
    public ResponseEntity<Watchlist> addWatchlistItem(@RequestBody Map<String, Object> request) {
        User user = requireAuthenticatedUser();

        Object typeObj = request.get("type");
        Object symbolObj = request.get("symbol");
        Object nameObj = request.get("name");

        if (typeObj == null || typeObj.toString().isBlank()) {
            throw new IllegalArgumentException("type is required");
        }
        if (nameObj == null || nameObj.toString().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }

        Asset.AssetType type;
        try {
            type = Asset.AssetType.valueOf(typeObj.toString().trim().toLowerCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid asset type");
        }

        Watchlist item = new Watchlist();
        item.setUser(user);
        item.setType(type);
        item.setSymbol(RequestValidation.symbol(symbolObj));
        item.setName(RequestValidation.requiredText(nameObj, "name", 255));
        item.setCreatedAt(LocalDateTime.now());

        Watchlist savedItem = watchlistService.save(item);
        logger.info("Item added to watchlist for user {}: {}", user.getId(), savedItem.getSymbol());
        return ResponseEntity.ok(savedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteWatchlistItem(@PathVariable Long id) {
        User user = requireAuthenticatedUser();

        Watchlist item = watchlistService.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist item not found"));

        watchlistService.delete(item.getId());
        logger.info("Item deleted from watchlist: {}", id);
        return ResponseEntity.ok(Map.of("message", "Item removed from watchlist"));
    }
}
