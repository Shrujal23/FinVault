package com.fintech.dto;

import com.fintech.entity.Asset;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;

public record AssetDto(
    Long id,
    Asset.AssetType type,
    String symbol,
    String name,
    BigDecimal quantity,
    BigDecimal avgBuyPrice,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    String sector,
    List<String> tags,
    @JsonProperty("userId") Long userId
) {

    private static final ObjectMapper mapper = new ObjectMapper();

    public static AssetDto fromEntity(Asset asset) {
        List<String> tags = List.of();

        // Parses the tags from JSON string to List<String>
        if (asset.getTags() != null && !asset.getTags().isBlank() && !asset.getTags().equals("[]")) {
            try {
                tags = mapper.readValue(asset.getTags(), new TypeReference<List<String>>() {});
            } catch (JsonProcessingException e) {
                tags = List.of();
            }
        }

        return new AssetDto(
                asset.getId(),
                asset.getType(),
                asset.getSymbol(),
                asset.getName(),
                asset.getQuantity(),
                asset.getAvgBuyPrice(),
                asset.getCreatedAt(),
                asset.getUpdatedAt(),
                asset.getSector(),
                tags,
                asset.getUserId()
        );
    }
}
