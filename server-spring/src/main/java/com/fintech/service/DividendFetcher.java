package com.fintech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintech.entity.Dividend;
import com.fintech.repository.AssetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Iterator;

@Component
public class DividendFetcher {

    private static final Logger log = LoggerFactory.getLogger(DividendFetcher.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper mapper = new ObjectMapper();
    private final DividendService dividendService;
    private final AssetRepository assetRepository;

    @Value("${alphavantage.base}")
    private String alphaBase;

    @Value("${alphavantage.api-key}")
    private String alphaKey;

    public DividendFetcher(RestTemplate restTemplate, DividendService dividendService, AssetRepository assetRepository) {
        this.restTemplate = restTemplate;
        this.dividendService = dividendService;
        this.assetRepository = assetRepository;
    }

    // Run once daily at 02:30 UTC
    @Scheduled(cron = "0 30 2 * * ?")
    public void scheduledFetch() {
        log.info("Starting scheduled dividend fetch");
        try {
            // For each unique asset symbol in DB, fetch recent dividend records
            assetRepository.findAll().stream()
                    .map(a -> a.getSymbol())
                    .distinct()
                    .forEach(this::fetchForSymbolSafely);
        } catch (Exception e) {
            log.error("Scheduled dividend fetch failed", e);
        }
    }

    private void fetchForSymbolSafely(String symbol) {
        try {
            fetchForSymbol(symbol);
        } catch (Exception e) {
            log.warn("Failed to fetch dividends for {}: {}", symbol, e.getMessage());
        }
    }

    public void fetchForSymbol(String symbol) throws Exception {
        if (symbol == null || symbol.isEmpty()) return;
        String url = String.format("%s/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=%s&apikey=%s", alphaBase, symbol, alphaKey);
        String raw = restTemplate.getForObject(url, String.class);
        if (raw == null) return;
        JsonNode root = mapper.readTree(raw);
        JsonNode timeSeries = root.get("Time Series (Daily)");
        if (timeSeries == null) return;

        Iterator<String> dates = timeSeries.fieldNames();
        while (dates.hasNext()) {
            String d = dates.next();
            JsonNode entry = timeSeries.get(d);
            if (entry == null) continue;
            double divamt = 0.0;
            try {
                JsonNode divNode = entry.get("7. dividend amount");
                if (divNode != null) divamt = Double.parseDouble(divNode.asText());
            } catch (Exception ignored) {}

            if (divamt > 0) {
                Dividend dv = new Dividend();
                dv.setTicker(symbol.toUpperCase());
                dv.setAmount(divamt);
                dv.setCurrency("USD");
                LocalDate ld = LocalDate.parse(d);
                Instant ex = ld.atStartOfDay().toInstant(ZoneOffset.UTC);
                dv.setExDate(ex);
                dv.setFetchedAt(Instant.now());
                dv.setSource("alphavantage");
                dividendService.save(dv);
            }
        }
    }
}
