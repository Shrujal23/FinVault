package com.fintech.controller;

import com.fintech.entity.JwtUtils;
import com.fintech.entity.User;
import com.fintech.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") 
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${auth.return-reset-token:false}")
    private boolean returnResetToken;

    // ---------------- Register ----------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        if (password == null || password.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));

        try {
            User user = userService.registerUser(email, password);
            String token = jwtUtils.generateToken(user);

            System.out.println("[AuthController.register] User registered: " + email + ", Token issued");

            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully",
                    "token", token,
                    "user", Map.of("id", user.getId(), "email", user.getEmail())
            ));
        } catch (RuntimeException e) {
            System.out.println("[AuthController.register] Error: " + e.getMessage());
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

            System.out.println("[AuthController.login] User logged in: " + email + ", User ID: " + user.getId() + ", Token issued");

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", token,
                    "user", Map.of("id", user.getId(), "email", user.getEmail())
            ));
        }

        System.out.println("[AuthController.login] Failed login attempt for: " + email);
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
            System.out.println("[AuthController.forgotPassword] Password reset requested for: " + email);
            // In a real system, send an email with a link containing the token. For dev, log the link for manual testing.
            System.out.println("[AuthController.forgotPassword] SIMULATING EMAIL: Reset link would be /reset-password/" + resetToken);
            if (returnResetToken) {
                // Return token in response for local dev convenience
                return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a password reset link has been sent.", "resetToken", resetToken));
            }
        } else {
            System.out.println("[AuthController.forgotPassword] Password reset requested for non-existent email: " + email);
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
        System.out.println("[AuthController.forgotPasswordPhone] SIMULATING SMS: Reset code would be sent to phone: " + phone);
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
        if (newPassword == null || newPassword.isBlank() || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }

        boolean ok = userService.resetPasswordWithToken(token, newPassword);
        if (!ok) {
            return ResponseEntity.status(400).body(Map.of("error", "Invalid or expired token"));
        }

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}