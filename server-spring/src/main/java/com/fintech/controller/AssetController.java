package com.fintech.controller;

import com.fintech.dto.AssetDto;
import com.fintech.entity.Asset;
import com.fintech.entity.User;
import com.fintech.entity.JwtUtils;
import com.fintech.service.AssetService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private static final Logger logger = LoggerFactory.getLogger(AssetController.class);

    @Autowired
    private AssetService assetService;

    @Autowired
    private JwtUtils jwtUtils;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ---------------------- GET ALL ----------------------

    @GetMapping
    public ResponseEntity<?> getAssets(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(value = "enrich", defaultValue = "false") boolean enrich
    ) {

        Optional<User> userOpt = validateTokenAndGetUser(token);
        if (userOpt.isEmpty()) return unauthorized("Invalid token for getAssets");

        try {
            User user = userOpt.get();
            List<Asset> assets = assetService.getAssetsByUser(user);

            if (!enrich) {
                List<AssetDto> dtos = assets.stream().map(AssetDto::fromEntity).collect(Collectors.toList());
                return ResponseEntity.ok(Map.of("assets", dtos));
            }

            return ResponseEntity.ok(enrichAssetsData(assets));

        } catch (Exception e) {
            logger.error("Error fetching assets: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Unable to fetch assets", "details", e.getMessage()));
        }
    }

    // ---------------------- CREATE ----------------------

    @PostMapping
    public ResponseEntity<?> createAsset(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, Object> req
    ) {

        Optional<User> userOpt = validateTokenAndGetUser(token);
        if (userOpt.isEmpty()) return unauthorized("Invalid token for createAsset");

        try {
            Asset asset = new Asset();
            asset.setUser(userOpt.get());
            
            populateAssetFromRequest(asset, req);
            asset.setCreatedAt(LocalDateTime.now());

            Asset saved = assetService.saveAsset(asset);
            return ResponseEntity.ok(AssetDto.fromEntity(saved));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            logger.error("Error creating asset: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Could not create asset", "details", e.getMessage()));
        }
    }

    // ---------------------- UPDATE ----------------------

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAsset(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long id,
            @RequestBody Map<String, Object> req
    ) {

        Optional<User> userOpt = validateTokenAndGetUser(token);
        if (userOpt.isEmpty()) return unauthorized("Invalid token for updateAsset");

        try {
            User user = userOpt.get();
            Asset asset = assetService.getAssetByIdAndUser(id, user)
                    .orElseThrow(() -> new IllegalArgumentException("Asset not found or unauthorized"));

            populateAssetFromRequest(asset, req);

            Asset updated = assetService.saveAsset(asset);
            return ResponseEntity.ok(AssetDto.fromEntity(updated));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            logger.error("Error updating asset: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Could not update asset", "details", e.getMessage()));
        }
    }

    // ---------------------- DELETE ----------------------

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAsset(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long id
    ) {

        Optional<User> userOpt = validateTokenAndGetUser(token);
        if (userOpt.isEmpty()) return unauthorized("Invalid token for deleteAsset");

        try {
            User user = userOpt.get();
            Asset asset = assetService.getAssetByIdAndUser(id, user)
                    .orElseThrow(() -> new IllegalArgumentException("Asset not found or unauthorized"));

            assetService.deleteAsset(asset.getId());

            return ResponseEntity.ok(Map.of("message", "Asset deleted"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            logger.error("Error deleting asset: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Could not delete asset", "details", e.getMessage()));
        }
    }

    // ---------------------- HELPERS ----------------------

    private Optional<User> validateTokenAndGetUser(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return jwtUtils.getUserFromToken(token);
    }

    private ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: " + message));
    }

    private Map<String, Object> enrichAssetsData(List<Asset> assets) {
        List<String> stockSymbols = assets.stream()
                .filter(a -> a.getType() != Asset.AssetType.crypto)
                .map(a -> a.getSymbol().toUpperCase())
                .distinct()
                .collect(Collectors.toList());

        List<String> cryptoSymbols = assets.stream()
                .filter(a -> a.getType() == Asset.AssetType.crypto)
                .map(Asset::getSymbol)
                .distinct()
                .collect(Collectors.toList());

        Map<String, BigDecimal> stockPrices = assetService.getLivePrices(stockSymbols);
        Map<String, BigDecimal> cryptoPrices = assetService.getCryptoPrices(cryptoSymbols);

        List<Map<String, Object>> enriched = new ArrayList<>();
        double total = 0.0;

        for (Asset a : assets) {
            Map<String, Object> m = new HashMap<>();
            String sym = a.getSymbol() != null ? a.getSymbol() : "";
            String symUp = sym.toUpperCase();

            double live = 0.0;
            if (a.getType() == Asset.AssetType.crypto) {
                BigDecimal bd = cryptoPrices.get(symUp);
                if (bd == null) bd = cryptoPrices.get(sym);
                live = (bd != null) ? bd.doubleValue() : 0.0;
            } else {
                BigDecimal bd = stockPrices.get(symUp);
                live = (bd != null) ? bd.doubleValue() : 0.0;
            }

            double marketValue = (a.getQuantity() != null) ? a.getQuantity().doubleValue() * live : 0.0;
            total += marketValue;

            double cost = (a.getQuantity() != null && a.getAvgBuyPrice() != null) ? a.getQuantity().doubleValue() * a.getAvgBuyPrice().doubleValue() : 0.0;
            double pnl = marketValue - cost;
            double returnPct = cost > 0 ? (pnl / cost) * 100 : 0.0;

            m.put("id", a.getId());
            m.put("type", a.getType());
            m.put("name", a.getName());
            m.put("symbol", a.getSymbol());
            m.put("quantity", a.getQuantity());
            m.put("avgBuyPrice", a.getAvgBuyPrice());
            m.put("lastPriceINR", live);
            m.put("marketValue", marketValue);
            m.put("pnl", pnl);
            m.put("returnPct", returnPct);

            enriched.add(m);
        }

        return Map.of("assets", enriched, "totalMarketValue", total);
    }

    private void populateAssetFromRequest(Asset asset, Map<String, Object> req) {
        asset.setType(Asset.AssetType.valueOf(req.get("type").toString()));
        asset.setSymbol(req.get("symbol").toString());

        String providedName = getString(req, "name");
        if (providedName == null || providedName.isBlank()) {
            Map<String, Object> info = assetService.resolveSymbolDetails(asset.getSymbol());
            String resolved = (String) info.getOrDefault("name", null);
            asset.setName(resolved != null ? resolved : asset.getSymbol());
            
            if (!req.containsKey("sector") || getString(req, "sector") == null) {
                asset.setSector((String) info.getOrDefault("exchange", null));
            }
        } else {
            asset.setName(providedName);
        }

        asset.setQuantity(new BigDecimal(req.get("quantity").toString()));

        String avg1 = getString(req, "avgBuyPrice");
        String avg2 = getString(req, "avg_buy_price");
        String finalAvg = (avg1 != null) ? avg1 : (avg2 != null ? avg2 : "0");
        asset.setAvgBuyPrice(new BigDecimal(finalAvg));

        if (req.containsKey("sector")) asset.setSector(String.valueOf(req.get("sector")));
        asset.setTags(parseTags(req.get("tags")));
    }

    private String getString(Map<String, Object> req, String key) {
        if (req.containsKey(key) && req.get(key) != null) {
            return req.get(key).toString();
        }
        return null;
    }

    private String parseTags(Object raw) {
        try {
            if (raw instanceof List<?> list) {
                List<String> tags = list.stream()
                        .map(String::valueOf)
                        .collect(Collectors.toList());

                return objectMapper.writeValueAsString(tags);
            }
        } catch (Exception ignored) {}

        return "[]";
    }
}
