package com.fintech.dto;

import com.fintech.entity.Asset;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class AssetDto {

    private Long id;
    private Asset.AssetType type;
    private String symbol;
    private String name;
    private BigDecimal quantity;
    private BigDecimal avgBuyPrice;
    private LocalDateTime createdAt;
    private String sector;
    private List<String> tags;

    // Optional: expose userId safely to frontend
    @JsonProperty("userId")
    private Long userId;

    // Constructor
    public AssetDto() {}

    // Static factory method
    public static AssetDto fromEntity(Asset asset) {
        AssetDto dto = new AssetDto();
        dto.setId(asset.getId());
        dto.setType(asset.getType());
        dto.setSymbol(asset.getSymbol());
        dto.setName(asset.getName());
        dto.setQuantity(asset.getQuantity());
        dto.setAvgBuyPrice(asset.getAvgBuyPrice());
        dto.setCreatedAt(asset.getCreatedAt());
        dto.setSector(asset.getSector());
        dto.setUserId(asset.getUserId());

        // Parse tags from JSON string to List<String>
        if (asset.getTags() != null && !asset.getTags().isEmpty()) {
            try {
                // Assuming tags are stored as JSON array string
                dto.setTags(List.of(asset.getTags().replace("[", "").replace("]", "").replace("\"", "").split(",")));
            } catch (Exception e) {
                dto.setTags(List.of());
            }
        } else {
            dto.setTags(List.of());
        }

        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Asset.AssetType getType() { return type; }
    public void setType(Asset.AssetType type) { this.type = type; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getAvgBuyPrice() { return avgBuyPrice; }
    public void setAvgBuyPrice(BigDecimal avgBuyPrice) { this.avgBuyPrice = avgBuyPrice; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
