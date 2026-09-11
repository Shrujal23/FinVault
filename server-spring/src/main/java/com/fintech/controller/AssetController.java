package com.fintech.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintech.dto.AssetDto;
import com.fintech.entity.Asset;
import com.fintech.entity.User;
import com.fintech.exception.ResourceNotFoundException;
import com.fintech.service.AssetService;
import com.fintech.service.PortfolioService;
import com.fintech.validation.RequestValidation;

@RestController
@RequestMapping("/api/assets")
public class AssetController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(AssetController.class);

    private final AssetService assetService;
    private final PortfolioService portfolioService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AssetController(AssetService assetService, PortfolioService portfolioService) {
        this.assetService = assetService;
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public ResponseEntity<?> getAssets(@RequestParam(value = "enrich", defaultValue = "false") boolean enrich) {
        User user = requireAuthenticatedUser();
        List<Asset> assets = assetService.getAssetsByUser(user);

        if (!enrich) {
            List<AssetDto> dtos = assets.stream().map(AssetDto::fromEntity).collect(Collectors.toList());
            return ResponseEntity.ok(Map.of("assets", dtos));
        }

        Map<String, Object> summary = portfolioService.buildSummary(user);
        return ResponseEntity.ok(Map.of(
            "assets", summary.get("items"),
            "totalMarketValue", summary.get("totalMarketValue")
        ));
    }

    @PostMapping
    public ResponseEntity<AssetDto> createAsset(@RequestBody Map<String, Object> req) {
        User user = requireAuthenticatedUser();
        Asset asset = new Asset();
        asset.setUser(user);
        populateAssetFromRequest(asset, req);
        asset.setCreatedAt(LocalDateTime.now());

        Asset saved = assetService.saveAsset(asset);
        logger.info("Asset created for user {}: {}", user.getId(), saved.getSymbol());
        return ResponseEntity.ok(AssetDto.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetDto> updateAsset(
            @PathVariable Long id,
            @RequestBody Map<String, Object> req) {
        User user = requireAuthenticatedUser();
        Asset asset = assetService.getAssetByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));

        populateAssetFromRequest(asset, req);
        Asset updated = assetService.saveAsset(asset);
        return ResponseEntity.ok(AssetDto.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAsset(@PathVariable Long id) {
        User user = requireAuthenticatedUser();
        Asset asset = assetService.getAssetByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));

        assetService.deleteAsset(asset.getId());
        return ResponseEntity.ok(Map.of("message", "Asset deleted"));
    }

    private void populateAssetFromRequest(Asset asset, Map<String, Object> req) {
        if (req == null || req.isEmpty()) {
            throw new IllegalArgumentException("Request body is required");
        }

        Object typeObj = req.get("type");
        if (typeObj == null || typeObj.toString().isBlank()) {
            throw new IllegalArgumentException("type is required");
        }
        try {
            asset.setType(Asset.AssetType.valueOf(typeObj.toString().trim().toLowerCase()));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid asset type");
        }

        asset.setSymbol(RequestValidation.symbol(req.get("symbol")));

        String providedName = getString(req, "name");
        if (providedName == null || providedName.isBlank()) {
            Map<String, Object> info = assetService.resolveSymbolDetails(asset.getSymbol());
            String resolved = (String) info.getOrDefault("name", null);
            asset.setName(resolved != null ? resolved : asset.getSymbol());

            if (!req.containsKey("sector") || getString(req, "sector") == null) {
                asset.setSector((String) info.getOrDefault("exchange", null));
            }
        } else {
            asset.setName(RequestValidation.requiredText(providedName, "name", 255));
        }

        Object quantityObj = req.get("quantity");
        if (quantityObj == null) {
            throw new IllegalArgumentException("quantity is required");
        }
        BigDecimal quantity = new BigDecimal(quantityObj.toString());
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("quantity must be greater than zero");
        }
        asset.setQuantity(quantity);

        String avg1 = getString(req, "avgBuyPrice");
        String avg2 = getString(req, "avg_buy_price");
        String finalAvg = (avg1 != null) ? avg1 : (avg2 != null ? avg2 : null);
        if (finalAvg == null || finalAvg.isBlank()) {
            throw new IllegalArgumentException("avgBuyPrice is required");
        }
        BigDecimal avgBuyPrice = new BigDecimal(finalAvg);
        if (avgBuyPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("avgBuyPrice cannot be negative");
        }
        asset.setAvgBuyPrice(avgBuyPrice);

        if (req.containsKey("sector")) {
            String sector = getString(req, "sector");
            asset.setSector(sector != null && !sector.isBlank()
                    ? RequestValidation.requiredText(sector, "sector", 100)
                    : null);
        }
        asset.setTags(parseTags(req.get("tags")));
    }

    private String getString(Map<String, Object> req, String key) {
        if (req.containsKey(key) && req.get(key) != null) {
            return req.get(key).toString();
        }
        return null;
    }

    private String parseTags(Object raw) {
        if (!(raw instanceof List<?> list)) {
            return "[]";
        }

        try {
            List<String> tags = list.stream()
                    .map(String::valueOf)
                    .filter(t -> !t.isBlank())
                    .collect(Collectors.toList());
            return objectMapper.writeValueAsString(tags);
        } catch (com.fasterxml.jackson.core.JsonProcessingException ignored) {
        }
        return "[]";
    }
}
