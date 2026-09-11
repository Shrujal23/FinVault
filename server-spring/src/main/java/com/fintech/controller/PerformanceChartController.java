package com.fintech.controller;

import com.fintech.entity.Asset;
import com.fintech.entity.User;
import com.fintech.service.AssetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/performance")
public class PerformanceChartController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceChartController.class);

    private static final double BASE_PORTFOLIO_VALUE = 100000.0;
    private static final double DAILY_VOLATILITY = 0.04;
    private static final double DAILY_GAIN = 1.0003;
    private static final int PERFORMANCE_DAYS = 30;
    private static final String DATE_FORMAT = "yyyy-MM-dd";
    private static final long RANDOM_SEED = 12345;

    private final AssetService assetService;

    public PerformanceChartController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping("/chart")
    public ResponseEntity<?> getPerformanceChart() {
        User user = requireAuthenticatedUser();
        List<Asset> assets = assetService.getAssetsByUser(user);
        List<Map<String, Object>> chartData = generatePerformanceData(assets, user.getId());
        logger.info("Performance chart generated for user {}", user.getEmail());
        return ResponseEntity.ok(buildResponse(chartData));
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

        PerformanceCalculator calculator = new PerformanceCalculator(initialValue, RANDOM_SEED + (userId != null ? userId : 0L));

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            calculator.updateValue();
            data.add(createDataEntry(date, formatter, calculator));
        }

        return data;
    }

    private double calculateInitialPortfolioValue(List<Asset> assets) {
        double value = BASE_PORTFOLIO_VALUE;
        for (Asset asset : assets) {
            if (asset.getQuantity() != null && asset.getAvgBuyPrice() != null) {
                value += asset.getQuantity().doubleValue() * asset.getAvgBuyPrice().doubleValue();
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

    private static class PerformanceCalculator {
        private final double initialValue;
        private double currentValue;
        private final Random random;

        PerformanceCalculator(double initialValue, long seed) {
            this.initialValue = initialValue;
            this.currentValue = initialValue;
            this.random = new Random(seed);
        }

        void updateValue() {
            double changePercent = (random.nextDouble() - 0.5) * DAILY_VOLATILITY;
            currentValue = currentValue * (1 + changePercent);
            currentValue = currentValue * DAILY_GAIN;
        }

        double getCurrentValue() {
            return Math.round(currentValue * 100.0) / 100.0;
        }

        double getPercentageChange() {
            double change = (currentValue - initialValue) / initialValue * 10000.0;
            return Math.round(change) / 100.0;
        }
    }
}
