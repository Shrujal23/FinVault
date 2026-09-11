package com.fintech.controller;

import com.fintech.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/pay")
public class BillingController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(BillingController.class);

    @PostMapping("/create-session")
    public ResponseEntity<?> createCheckoutSession(
            @RequestParam(defaultValue = "pro") String plan,
            @RequestParam(defaultValue = "monthly") String cycle) {
        User user = requireAuthenticatedUser();
        logger.info("Checkout requested by {} for plan {} ({})", user.getEmail(), plan, cycle);
        return ResponseEntity.ok(Map.of(
                "url", "https://example.com/checkout?plan=" + plan + "&cycle=" + cycle,
                "plan", plan,
                "cycle", cycle
        ));
    }
}
