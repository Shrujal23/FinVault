package com.fintech.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(
        name = "assets",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "symbol"})
        }
)
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Prevent infinite recursion: Asset → User → Assets → ...
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType type;

    @NotNull
    @Column(nullable = false)
    private String symbol;

    @NotNull
    @Column(nullable = false)
    private String name;

    @NotNull
    @DecimalMin("0.00000001")
    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal quantity;

    @NotNull
    @DecimalMin("0.0")
    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal avgBuyPrice;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Can be null
    private String sector;

    // JSON stored as String
    @Column(columnDefinition = "JSON")
    private String tags;

    public enum AssetType {
        stock, mutual, crypto, real_estate, fd, cash
    }

    // ------------------ Custom JSON Fields ------------------

    // Optional: expose userId safely to frontend
    @JsonProperty("userId")
    public Long getUserId() {
        return (user != null) ? user.getId() : null;
    }

    // ------------------ Getters & Setters ------------------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public AssetType getType() { return type; }
    public void setType(AssetType type) { this.type = type; }

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

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}
