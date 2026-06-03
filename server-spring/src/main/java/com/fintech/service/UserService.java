package com.fintech.service;

import com.fintech.entity.User;
import com.fintech.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ---------------------- Register User ----------------------
    public User registerUser(String email, String password) {

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        String hashedPassword = passwordEncoder.encode(password);

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(hashedPassword);

        return userRepository.save(user);
    }

    // ---------------------- Find User by Email ----------------------
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // ---------------------- Validate Password ----------------------
    public boolean validatePassword(String rawPassword, String storedHash) {
        return passwordEncoder.matches(rawPassword, storedHash);
    }

    // ---------------------- Password Reset ----------------------
    public Optional<String> generatePasswordResetToken(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return Optional.empty();

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetExpiry(java.time.LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        return Optional.of(token);
    }

    public boolean isResetTokenValid(String token) {
        if (token == null || token.isBlank()) return false;
        Optional<User> userOpt = userRepository.findByPasswordResetToken(token);
        if (userOpt.isEmpty()) return false;
        User user = userOpt.get();
        return user.getPasswordResetExpiry() != null && user.getPasswordResetExpiry().isAfter(java.time.LocalDateTime.now());
    }

    public boolean resetPasswordWithToken(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findByPasswordResetToken(token);
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
}
