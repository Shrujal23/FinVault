package com.fintech.controller;

import com.fintech.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/snapshots")
public class SnapshotController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(SnapshotController.class);

    @GetMapping
    public ResponseEntity<?> getSnapshots() {
        User user = requireAuthenticatedUser();

        List<Map<String, Object>> snapshots = new ArrayList<>();
        LocalDate today = LocalDate.now();
        Random random = new Random(user.getId() != null ? user.getId() : 1L);

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            BigDecimal value = BigDecimal.valueOf(50000 + random.nextDouble() * 10000);
            snapshots.add(Map.of(
                    "as_of_date", date.toString(),
                    "total_value_inr", value
            ));
        }

        logger.info("Snapshots fetched for user: {}", user.getEmail());
        return ResponseEntity.ok(Map.of("snapshots", snapshots));
    }
}
