package com.fintech.entity;

import com.fintech.repository.UserRepository;
import com.fintech.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;  // BASE64 encoded secret

    @Value("${jwt.expiration}")
    private String jwtExpiresIn; // e.g., "7d"

    @Autowired
    private UserRepository userRepository;

    private SecretKey getSigningKey() {
        byte[] decodedKey = Base64.getDecoder().decode(jwtSecret);
        return Keys.hmacShaKeyFor(decodedKey);
    }

    // ------------------- Generate JWT -------------------
    public String generateToken(User user) {
        long expirationMillis = parseExpiration(jwtExpiresIn);
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .setSubject(String.valueOf(user.getId()))
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // ------------------- Extract User from JWT -------------------
    public Optional<User> getUserFromToken(String token) {
        try {
            if (token.startsWith("Bearer "))
                token = token.substring(7);

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            Long userId = Long.parseLong(claims.getSubject());

            // DEBUG: log token info
            System.out.println("[DEBUG] Token subject/userId: " + userId);

            Optional<User> userOpt = userRepository.findById(userId);
            System.out.println("[DEBUG] User from DB: " + userOpt.map(User::getEmail).orElse("NOT FOUND"));

            return userOpt;

        } catch (Exception e) {
            System.err.println("[DEBUG] Failed to parse token: " + e.getMessage());
            return Optional.empty();
        }
    }

    // ------------------- Validate JWT -------------------
    public boolean validateToken(String token) {
        try {
            if (token.startsWith("Bearer "))
                token = token.substring(7);

            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);

            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("[DEBUG] Token validation failed: " + e.getMessage());
            return false;
        }
    }

    // ------------------- Parse Expiration -------------------
    private long parseExpiration(String exp) {
        try {
            if (exp.endsWith("d")) return Long.parseLong(exp.replace("d", "")) * 24L * 60 * 60 * 1000;
            if (exp.endsWith("h")) return Long.parseLong(exp.replace("h", "")) * 60L * 60 * 1000;
            if (exp.endsWith("m")) return Long.parseLong(exp.replace("m", "")) * 60L * 1000;
            if (exp.endsWith("s")) return Long.parseLong(exp.replace("s", "")) * 1000L;
            return Long.parseLong(exp);
        } catch (Exception e) {
            throw new RuntimeException("Invalid jwt.expiration format: " + exp);
        }
    }
}
