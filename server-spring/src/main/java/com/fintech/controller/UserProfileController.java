package com.fintech.controller;

import com.fintech.dto.UserDto;
import com.fintech.entity.JwtUtils;
import com.fintech.entity.User;
import com.fintech.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserProfileController {

    private static final Logger logger = LoggerFactory.getLogger(UserProfileController.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String token,
                                           @RequestBody Map<String, Object> request) {
        Optional<User> userOpt = validateTokenAndGetUser(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or missing token"));
        }

        User user = userOpt.get();
        if (request.containsKey("name")) {
            String name = String.valueOf(request.get("name")).trim();
            user.setName(name.isBlank() ? null : name);
        }
        if (request.containsKey("avatarBase64")) {
            String avatarBase64 = String.valueOf(request.get("avatarBase64")).trim();
            user.setAvatarUrl(avatarBase64.isBlank() ? null : avatarBase64);
        }

        userRepository.save(user);
        logger.info("Profile updated for user {}", user.getEmail());
        return ResponseEntity.ok(Map.of("user", UserDto.fromEntity(user)));
    }

    private Optional<User> validateTokenAndGetUser(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return jwtUtils.getUserFromToken(token);
    }
}
