package com.fintech.controller;

import com.fintech.entity.JwtUtils;
import com.fintech.entity.User;
import com.fintech.dto.UserDto;
import com.fintech.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;

    private final JwtUtils jwtUtils;

    @Value("${auth.return-reset-token:false}")
    private boolean returnResetToken;

    public AuthController(UserService userService, JwtUtils jwtUtils) {
        this.userService = userService;
        this.jwtUtils = jwtUtils;
    }

    // Build a safe DTO to return to clients (excludes sensitive fields)
    private UserDto buildUserPayload(User user) {
        return UserDto.fromEntity(user);
    }

    // ---------------- Register ----------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        if (password == null || password.isBlank()) {
            final var body1 = ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
            return body1;
        }

        try {
            userService.validatePasswordPolicy(password);
            User user = userService.registerUser(email, password);
            String token = jwtUtils.generateToken(user);

            logger.info("User registered: {}, Token issued", email);

                return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully!!!",
                    "token", token,
                    "user", buildUserPayload(user)
                ));
        } catch (RuntimeException e) {
            logger.warn("Registration error for {}: {}", email, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ---------------- Login ----------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        if (password == null || password.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isPresent() && userService.validatePassword(password, userOpt.get().getPasswordHash())) {
            User user = userOpt.get();
            String token = jwtUtils.generateToken(user);

            logger.info("User logged in: {}, User ID: {}, Token issued", email, user.getId());

                return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", token,
                    "user", buildUserPayload(user)
                ));
        }

        logger.warn("Failed login attempt for: {}", email);
        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }

    // ---------------- Forgot Password ----------------
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        Optional<String> tokenOpt = userService.generatePasswordResetToken(email);
        if (tokenOpt.isPresent()) {
            String resetToken = tokenOpt.get();
            logger.info("Password reset requested for: {}", email);
            if (returnResetToken) {
                return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a password reset link has been sent.", "resetToken", resetToken));
            }
        } else {
            logger.info("Password reset requested for non-existent email: {}", email);
        }

        return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a password reset link has been sent."));
    }

    @PostMapping("/forgot-password-phone")
    public ResponseEntity<?> forgotPasswordPhone(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Phone is required"));
        }

        // Simulate SMS code flow — in production you'd lookup user by phone and send a code via SMS provider
            logger.info("Password reset by phone requested");
        return ResponseEntity.ok(Map.of("message", "If an account with that phone exists, a reset code has been sent."));
    }

    @GetMapping("/reset-password/validate")
    public ResponseEntity<?> validateResetToken(@RequestParam("token") String token) {
        boolean ok = userService.isResetTokenValid(token);
        if (ok) return ResponseEntity.ok(Map.of("valid", true));
        return ResponseEntity.status(400).body(Map.of("valid", false, "error", "Invalid or expired token"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("password");

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token is required"));
        }
        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }

        try {
            userService.validatePasswordPolicy(newPassword);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }

        boolean ok = userService.resetPasswordWithToken(token, newPassword);
        if (!ok) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid or expired token"));
        }

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}