package com.fintech.controller;

import com.fintech.entity.User;
import com.fintech.entity.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/snapshots")
public class SnapshotController {

    private static final Logger logger = LoggerFactory.getLogger(SnapshotController.class);

    @Autowired
    private JwtUtils jwtUtils;

    // ---------------------- Get Portfolio Snapshots ----------------------
    @GetMapping
    public ResponseEntity<?> getSnapshots(@RequestHeader(value = "Authorization", required = false) String token) {
        Optional<User> userOpt = validateTokenAndGetUser(token);
        if (userOpt.isEmpty()) {
            logger.warn("Unauthorized access attempt to getSnapshots");
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        try {
            User user = userOpt.get();
            
            // Generate dummy snapshot data for demo purposes
            List<Map<String, Object>> snapshots = new ArrayList<>();
            LocalDate today = LocalDate.now();
            
            for (int i = 6; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                BigDecimal value = new BigDecimal(50000 + Math.random() * 10000); // Random value between 50k-60k
                
                snapshots.add(Map.of(
                        "as_of_date", date.toString(),
                        "total_value_inr", value
                ));
            }

            logger.info("Snapshots fetched for user: {}", user.getEmail());
            return ResponseEntity.ok(Map.of("snapshots", snapshots));

        } catch (Exception e) {
            logger.error("Error fetching snapshots: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Optional<User> validateTokenAndGetUser(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return jwtUtils.getUserFromToken(token);
    }
}