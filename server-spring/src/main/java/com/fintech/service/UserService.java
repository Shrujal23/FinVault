package com.fintech.service;

import com.fintech.entity.User;
import com.fintech.repository.UserRepository;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.Objects;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.regex.Pattern;

@Service
public class UserService {

    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s]).{12,}$");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void validatePasswordPolicy(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (password.length() < 12) {
            throw new IllegalArgumentException("Password must be at least 12 characters long");
        }
        if (password.chars().anyMatch(Character::isWhitespace)) {
            throw new IllegalArgumentException("Password cannot contain spaces");
        }
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException("Password must include uppercase, lowercase, a number, and a special character");
        }
    }

    // ---------------------- Register User ----------------------
    public User registerUser(String email, String password) {
        validatePasswordPolicy(password);

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email is already registered!!!");
        }

        String hashedPassword = passwordEncoder.encode(password);

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(hashedPassword);

        return Objects.requireNonNull(userRepository.save(user));
    }

    // ---------------------- Find User by Email ----------------------
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // ---------------------- Validate Password ----------------------
    public boolean validatePassword(String rawPassword, String storedHash) {
        return passwordEncoder.matches(rawPassword, storedHash);
    }

    public Optional<User> findById(@NonNull Long id) {
        return userRepository.findById(id);
    }

    public User updateProfile(@NonNull Long userId, String name, String avatarUrl) {
        User user = Objects.requireNonNull(userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found")));

        if (name != null) {
            user.setName(name.isBlank() ? null : name.trim());
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl.isBlank() ? null : avatarUrl.trim());
        }

        return userRepository.save(user);
    }

    // ---------------------- Password Reset ----------------------
    public Optional<String> generatePasswordResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return Optional.empty();

        User user = userOpt.get();
        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        user.setPasswordResetToken(hashResetToken(token));
        user.setPasswordResetExpiry(java.time.LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        return Optional.of(token);
    }

    public boolean isResetTokenValid(String token) {
        if (token == null || token.isBlank()) return false;
        Optional<User> userOpt = userRepository.findByPasswordResetToken(hashResetToken(token));
        if (userOpt.isEmpty()) return false;
        User user = userOpt.get();
        return user.getPasswordResetExpiry() != null && user.getPasswordResetExpiry().isAfter(java.time.LocalDateTime.now());
    }

    public boolean resetPasswordWithToken(String token, String newPassword) {
        validatePasswordPolicy(newPassword);

        Optional<User> userOpt = userRepository.findByPasswordResetToken(hashResetToken(token));
        if (userOpt.isEmpty()) return false;
        User user = userOpt.get();
        if (user.getPasswordResetExpiry() == null || user.getPasswordResetExpiry().isBefore(java.time.LocalDateTime.now())) return false;

        String hashed = passwordEncoder.encode(newPassword);
        user.setPasswordHash(hashed);
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        userRepository.save(user);
        return true;
    }

    private String hashResetToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Unable to hash password reset token", ex);
        }
    }
}
