package com.fintech.controller;

import com.fintech.entity.Asset;
import com.fintech.entity.User;
import com.fintech.service.AssetService;
import com.fintech.entity.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.stream.Collectors;

import java.util.*;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioController.class);

    @Autowired
    private AssetService assetService;

    @Autowired
    private JwtUtils jwtUtils;
    
    // ---------------------- Get Portfolio Summary ----------------------
    @GetMapping("/summary")
    public ResponseEntity<?> getPortfolioSummary(@RequestHeader(value = "Authorization", required = false) String token) {
        Optional<User> userOpt = validateTokenAndGetUser(token);
        if (userOpt.isEmpty()) {
            logger.warn("Unauthorized access attempt to getPortfolioSummary");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        try {
            User user = userOpt.get();
            List<Asset> assets = assetService.getAssetsByUser(user);

            // 1. Separate assets by type and get their symbols
            List<String> stockSymbols = assets.stream()
                .filter(a -> a.getType() != Asset.AssetType.crypto) // Check against the enum directly
                .map(asset -> asset.getSymbol().toUpperCase())
                .distinct()
                .collect(Collectors.toList());

            List<String> cryptoSymbols = assets.stream()
                .filter(a -> a.getType() == Asset.AssetType.crypto)
                .map(Asset::getSymbol)
                .distinct()
                .collect(Collectors.toList());

            // 2. Fetch prices using centralized AssetService
            Map<String, BigDecimal> stockPrices = assetService.getLivePrices(stockSymbols);
            Map<String, BigDecimal> cryptoPrices = assetService.getCryptoPrices(cryptoSymbols);

            // 3. Calculate summary and allocation in a single loop
            List<Map<String, Object>> items = new ArrayList<>();
            List<Map<String, Object>> allocation = new ArrayList<>();
            double totalPortfolioValue = 0.0;

            for (Asset asset : assets) {
                Map<String, Object> itemMap = new HashMap<>();
                String symbol = asset.getSymbol() != null ? asset.getSymbol() : "";
                String symbolUpper = symbol.toUpperCase();
                
                double livePrice = 0.0;
                if (asset.getType() == Asset.AssetType.crypto) {
                    BigDecimal bd = cryptoPrices.get(symbolUpper);
                    if (bd == null) bd = cryptoPrices.get(symbol);
                    livePrice = (bd != null) ? bd.doubleValue() : 0.0;
                } else {
                    BigDecimal bd = stockPrices.get(symbolUpper);
                    livePrice = (bd != null) ? bd.doubleValue() : 0.0;
                }
                
                Double marketValue = asset.getQuantity() != null ? asset.getQuantity().doubleValue() * livePrice : 0.0;

                itemMap.put("id", asset.getId());
                itemMap.put("type", asset.getType() != null ? asset.getType() : Asset.AssetType.stock);
                itemMap.put("name", asset.getName());
                itemMap.put("symbol", asset.getSymbol());
                itemMap.put("quantity", asset.getQuantity());
                itemMap.put("avgBuyPrice", asset.getAvgBuyPrice());
                itemMap.put("lastPriceINR", livePrice);
                itemMap.put("marketValue", marketValue);
                totalPortfolioValue += marketValue;

                Double costPrice = (asset.getQuantity() != null && asset.getAvgBuyPrice() != null) ? asset.getQuantity().doubleValue() * asset.getAvgBuyPrice().doubleValue() : 0.0;
                Double pnl = marketValue - costPrice;
                itemMap.put("pnl", pnl);

                Double returnPct = costPrice > 0 ? (pnl / costPrice) * 100 : 0.0;
                itemMap.put("returnPct", returnPct);

                items.add(itemMap);
            }

            for (Map<String, Object> item : items) {
                Map<String, Object> allocationItem = new HashMap<>();
                allocationItem.put("name", item.get("name"));
                allocationItem.put("symbol", item.get("symbol"));
                Double itemMarketValue = (Double) item.get("marketValue");
                Double weight = totalPortfolioValue > 0 ? (itemMarketValue / totalPortfolioValue) * 100 : 0.0;
                allocationItem.put("value", itemMarketValue);
                allocationItem.put("weight", weight);
                allocation.add(allocationItem);
            }

            return ResponseEntity.ok(Map.of("allocation", allocation, "items", items));

        } catch (Exception e) {
            logger.error("Error fetching portfolio summary: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Optional<User> validateTokenAndGetUser(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return jwtUtils.getUserFromToken(token);
    }
}