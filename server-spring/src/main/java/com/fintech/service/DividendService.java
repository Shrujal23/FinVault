package com.fintech.service;

import com.fintech.entity.Dividend;
import com.fintech.repository.DividendRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class DividendService {

    private final DividendRepository dividendRepository;

    public DividendService(DividendRepository dividendRepository) {
        this.dividendRepository = dividendRepository;
    }

    @Transactional
    public Dividend save(Dividend d) {
        if (d == null) return null;
        if (d.getFetchedAt() == null) d.setFetchedAt(Instant.now());

        // If exDate is present, avoid creating duplicate records for same ticker+exDate
        if (d.getExDate() != null) {
            List<Dividend> existing = dividendRepository.findByTickerOrderByExDateDesc(d.getTicker());
            for (Dividend e : existing) {
                if (e.getExDate() != null && e.getExDate().equals(d.getExDate())) {
                    // update amount/source and return
                    e.setAmount(d.getAmount());
                    e.setSource(d.getSource());
                    e.setFetchedAt(Instant.now());
                    return dividendRepository.save(e);
                }
            }
        }

        return dividendRepository.save(d);
    }

    public List<Dividend> listUpcoming(int days) {
        Instant now = Instant.now();
        // Include entries with today's ex-date. Date inputs are stored at midnight,
        // so using "now" here would hide a dividend added for today.
        Instant start = now.atZone(ZoneOffset.UTC)
                .toLocalDate()
                .atStartOfDay()
                .toInstant(ZoneOffset.UTC);
        Instant end = now.plusSeconds((long) days * 24 * 60 * 60);
        return dividendRepository.findByExDateBetweenOrderByExDateAsc(start, end);
    }

    public List<Dividend> findByTicker(String ticker) {
        return dividendRepository.findByTickerOrderByExDateDesc(ticker);
    }

    @Transactional
    public Dividend update(Long id, Dividend updatedDividend) {
        Dividend existing = dividendRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dividend not found"));

        existing.setTicker(updatedDividend.getTicker());
        existing.setAmount(updatedDividend.getAmount());
        existing.setCurrency(updatedDividend.getCurrency());
        existing.setExDate(updatedDividend.getExDate());
        existing.setPayDate(updatedDividend.getPayDate());
        existing.setFrequency(updatedDividend.getFrequency());
        existing.setFetchedAt(Instant.now());
        return dividendRepository.save(existing);
    }

    public void deleteById(Long id) {
        dividendRepository.deleteById(id);
    }

    public List<Dividend> findAll() {
        return dividendRepository.findAll();
    }
}
