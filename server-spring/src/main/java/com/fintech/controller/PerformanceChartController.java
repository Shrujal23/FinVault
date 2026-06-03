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

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/performance")
public class PerformanceChartController {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceChartController.class);

    private static final double BASE_PORTFOLIO_VALUE = 100000.0;
    private static final double DAILY_VOLATILITY = 0.04;  // +/- 2%
    private static final double DAILY_GAIN = 1.0003;      // 0.03% daily gain
    private static final int PERFORMANCE_DAYS = 30;
    private static final String DATE_FORMAT = "yyyy-MM-dd";
    private static final long RANDOM_SEED = 12345;

    @Autowired
    private AssetService assetService;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/chart")
    public ResponseEntity<?> getPerformanceChart(@RequestHeader(value = "Authorization", required = false) String token) {
        Optional<User> userOpt = validateTokenAndGetUser(token);
        if (userOpt.isEmpty()) {
            logger.warn("Unauthorized access attempt to getPerformanceChart");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        try {
            User user = userOpt.get();
            List<Asset> assets = assetService.getAssetsByUser(user);
            
            // Pass userId to seed the generator so each user gets a unique, consistent chart
            List<Map<String, Object>> chartData = generatePerformanceData(assets, user.getId());
            
            Map<String, Object> response = buildResponse(chartData);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error generating performance chart: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Optional<User> validateTokenAndGetUser(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return jwtUtils.getUserFromToken(token);
    }

    private Map<String, Object> buildResponse(List<Map<String, Object>> chartData) {
        Map<String, Object> response = new HashMap<>();
        response.put("data", chartData);
        response.put("currency", "INR");
        response.put("period", "30_DAYS");
        return response;
    }

    private List<Map<String, Object>> generatePerformanceData(List<Asset> assets, Long userId) {
        double initialValue = calculateInitialPortfolioValue(assets);
        List<Map<String, Object>> data = new ArrayList<>();
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(PERFORMANCE_DAYS - 1);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_FORMAT);
        
        PerformanceCalculator calculator = new PerformanceCalculator(initialValue, RANDOM_SEED + userId);
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            calculator.updateValue();
            Map<String, Object> entry = createDataEntry(date, formatter, calculator);
            data.add(entry);
        }
        
        return data;
    }

    private double calculateInitialPortfolioValue(List<Asset> assets) {
        double value = BASE_PORTFOLIO_VALUE;
        
        for (Asset asset : assets) {
            if (asset.getQuantity() != null && asset.getAvgBuyPrice() != null) {
                double assetValue = asset.getQuantity().doubleValue() * asset.getAvgBuyPrice().doubleValue();
                value += assetValue;
            }
        }
        
        return value;
    }

    private Map<String, Object> createDataEntry(LocalDate date, DateTimeFormatter formatter, 
                                                  PerformanceCalculator calculator) {
        Map<String, Object> entry = new HashMap<>();
        entry.put("date", date.format(formatter));
        entry.put("value", calculator.getCurrentValue());
        entry.put("change", calculator.getPercentageChange());
        return entry;
    }

    // Helper class to encapsulate performance calculations
    private class PerformanceCalculator {
        private final double initialValue;
        private double currentValue;
        private final Random random;

        public PerformanceCalculator(double initialValue, long seed) {
            this.initialValue = initialValue;
            this.currentValue = initialValue;
            this.random = new Random(seed);
        }

        public void updateValue() {
            double changePercent = (random.nextDouble() - 0.5) * DAILY_VOLATILITY;
            currentValue = currentValue * (1 + changePercent);
            currentValue = currentValue * DAILY_GAIN;
        }

        public double getCurrentValue() {
            return Math.round(currentValue * 100.0) / 100.0;
        }

        public double getPercentageChange() {
            double change = (currentValue - initialValue) / initialValue * 10000.0;
            return Math.round(change) / 100.0;
        }
    }
}
