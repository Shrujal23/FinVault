package com.fintech.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Logger logger = LoggerFactory.getLogger(ContactController.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    @PostMapping
    public ResponseEntity<?> submitContact(@RequestBody Map<String, Object> request) {
        String name = String.valueOf(request.getOrDefault("name", "")).trim();
        String email = String.valueOf(request.getOrDefault("email", "")).trim();
        String message = String.valueOf(request.getOrDefault("message", "")).trim();
        String topic = String.valueOf(request.getOrDefault("topic", "")).trim();

        if (name.isBlank() || email.isBlank() || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email, and message are required"));
        }

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email address"));
        }

        if (message.length() > 5000) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is too long"));
        }

        logger.info("Contact form submitted by {} ({}) about {}", name, email, topic.isBlank() ? "general" : topic);
        return ResponseEntity.ok(Map.of("message", "Thanks for reaching out. We will get back to you shortly."));
    }
}
