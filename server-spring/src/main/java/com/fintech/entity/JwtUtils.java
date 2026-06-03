package com.fintech.entity;

import com.fintech.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${jwt.secret}")
    private String jwtSecret;  // BASE64 encoded secret

    @Value("${jwt.expiration}")
    private String jwtExpiresIn;  //"7d"

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
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("avatarUrl", user.getAvatarUrl())
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

            // Reconstructed a stateless User object without hitting the database!
            User user = new User();
            user.setId(userId);
            
            if (claims.get("email") != null) {
                user.setEmail(claims.get("email", String.class));
            }
            if (claims.get("name") != null) {
                user.setName(claims.get("name", String.class));
            }
            if (claims.get("avatarUrl") != null) {
                user.setAvatarUrl(claims.get("avatarUrl", String.class));
            }

            return Optional.of(user);

        } catch (Exception e) {
            logger.debug("Failed to parse token: {}", e.getMessage());
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
            logger.debug("Token validation failed: {}", e.getMessage());
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
