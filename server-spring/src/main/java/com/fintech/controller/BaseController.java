package com.fintech.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fintech.entity.User;
import com.fintech.exception.UnauthorizedException;

public abstract class BaseController {

    protected Optional<User> getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return Optional.of(user);
        }
        if ("anonymousUser".equals(principal)) {
            return Optional.empty();
        }
        return Optional.empty();
    }

    protected User requireAuthenticatedUser() {
        return getAuthenticatedUser()
        .orElseThrow(() -> new UnauthorizedException("Authentication required"));
    }

    protected ResponseEntity<Map<String, String>> unauthorized(String message) {
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: " + message));
    }

    protected ResponseEntity<Map<String, String>> notFound(String message) {
        return ResponseEntity.status(404).body(Map.of("error", message));
    }

    protected ResponseEntity<Map<String, String>> badRequest(String message) {
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
