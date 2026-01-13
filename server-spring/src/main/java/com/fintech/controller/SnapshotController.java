package com.fintech.controller;

import com.fintech.entity.User;
import com.fintech.entity.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/snapshots")
public class SnapshotController {

    @Autowired
    private JwtUtils jwtUtils;

    // ---------------------- Get Portfolio Snapshots ----------------------
    @GetMapping
    public ResponseEntity<?> getSnapshots(@RequestHeader(value = "Authorization", required = false) String token) {
        System.out.println("[SnapshotController.getSnapshots] Received token: " + (token != null ? token.substring(0, Math.min(30, token.length())) + "..." : "null"));
        
        if (token == null || token.isBlank()) {
            System.out.println("[SnapshotController.getSnapshots] Authorization header missing");
            return ResponseEntity.status(401).body(Map.of("error", "Authorization header missing"));
        }

        Optional<User> userOpt = jwtUtils.getUserFromToken(token);
        System.out.println("[SnapshotController.getSnapshots] getUserFromToken result: " + (userOpt.isPresent() ? "User found: " + userOpt.get().getEmail() : "User NOT found"));
        
        if (userOpt.isEmpty()) {
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

            System.out.println("[SnapshotController.getSnapshots] Snapshots fetched for user: " + user.getEmail());
            return ResponseEntity.ok(Map.of("snapshots", snapshots));

        } catch (Exception e) {
            System.out.println("[SnapshotController.getSnapshots] Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}