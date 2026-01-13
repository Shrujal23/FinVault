package com.fintech.controller;

import com.fintech.entity.Asset;
import com.fintech.entity.User;
import com.fintech.service.AssetService;
import com.fintech.entity.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/performance")
public class PerformanceChartController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private JwtUtils jwtUtils;

    // ---------------------- Get Performance Chart Data ----------------------
    @GetMapping("/chart")
    public ResponseEntity<?> getPerformanceChart(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("[PerformanceChartController.getPerformanceChart] Received token: " + (token != null ? token.substring(0, Math.min(30, token.length())) + "..." : "null"));
        
        if (token == null || token.isBlank()) {
            System.out.println("[PerformanceChartController.getPerformanceChart] Authorization header missing");
            return ResponseEntity.status(401).body(Map.of("error", "Authorization header missing"));
        }

        Optional<User> userOpt = jwtUtils.getUserFromToken(token);
        System.out.println("[PerformanceChartController.getPerformanceChart] getUserFromToken result: " + (userOpt.isPresent() ? "User found: " + userOpt.get().getEmail() : "User NOT found"));
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        try {
            User user = userOpt.get();
            List<Asset> assets = assetService.getAssetsByUser(user);
            
            // Generate 30 days of mock performance data
            List<Map<String, Object>> chartData = generatePerformanceData(assets);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", chartData);
            response.put("currency", "INR");
            response.put("period", "30_DAYS");

            System.out.println("[PerformanceChartController.getPerformanceChart] Chart data generated for user: " + user.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.out.println("[PerformanceChartController.getPerformanceChart] Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Generate 30 days of mock performance data with realistic trends
    private List<Map<String, Object>> generatePerformanceData(List<Asset> assets) {
        List<Map<String, Object>> data = new ArrayList<>();
        
        // Calculate initial portfolio value
        double initialValue = 100000.0;  // Starting with 100k as base
        for (Asset asset : assets) {
            if (asset.getQuantity() != null && asset.getAvgBuyPrice() != null) {
                initialValue += asset.getQuantity().doubleValue() * asset.getAvgBuyPrice().doubleValue();
            }
        }
        
        // Generate last 30 days of data
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(29);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        double currentValue = initialValue;
        double maxValue = initialValue;
        double minValue = initialValue;
        Random random = new Random(12345);  
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            // Generate realistic market movement: -2% to +2% daily
            double changePercent = (random.nextDouble() - 0.5) * 0.04;
            currentValue = currentValue * (1 + changePercent);
            
            
            currentValue = currentValue * 1.0003;
            
            maxValue = Math.max(maxValue, currentValue);
            minValue = Math.min(minValue, currentValue);
            
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", date.format(formatter));
            entry.put("value", Math.round(currentValue * 100.0) / 100.0);  
            entry.put("change", Math.round((currentValue - initialValue) / initialValue * 10000.0) / 100.0);  // % change
            data.add(entry);
        }
        
        System.out.println("[PerformanceChartController] Generated " + data.size() + " days of performance data");
        System.out.println("[PerformanceChartController] Portfolio value range: ₹" + Math.round(minValue) + " - ₹" + Math.round(maxValue));
        
        return data;
    }
}
