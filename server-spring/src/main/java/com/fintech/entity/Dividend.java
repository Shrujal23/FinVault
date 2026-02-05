package com.fintech.entity;

import javax.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "dividends")
public class Dividend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ticker;

    private Double amount;

    private String currency;

    private Instant declarationDate;
    private Instant exDate;
    private Instant recordDate;
    private Instant payDate;

    private String frequency;

    private String source;

    private Instant fetchedAt;

    public Dividend() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Instant getDeclarationDate() { return declarationDate; }
    public void setDeclarationDate(Instant declarationDate) { this.declarationDate = declarationDate; }

    public Instant getExDate() { return exDate; }
    public void setExDate(Instant exDate) { this.exDate = exDate; }

    public Instant getRecordDate() { return recordDate; }
    public void setRecordDate(Instant recordDate) { this.recordDate = recordDate; }

    public Instant getPayDate() { return payDate; }
    public void setPayDate(Instant payDate) { this.payDate = payDate; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public Instant getFetchedAt() { return fetchedAt; }
    public void setFetchedAt(Instant fetchedAt) { this.fetchedAt = fetchedAt; }
}
