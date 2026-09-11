package com.fintech.controller;

import com.fintech.dto.UserDto;
import com.fintech.entity.JwtUtils;
import com.fintech.entity.User;
import com.fintech.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserProfileController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(UserProfileController.class);

    private final UserService userService;
    private final JwtUtils jwtUtils;

    public UserProfileController(UserService userService, JwtUtils jwtUtils) {
        this.userService = userService;
        this.jwtUtils = jwtUtils;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        User authUser = requireAuthenticatedUser();
        User user = userService.findById(authUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(Map.of("user", UserDto.fromEntity(user)));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> request) {
        User authUser = requireAuthenticatedUser();

        String name = request.containsKey("name") ? String.valueOf(request.get("name")) : null;
        String avatarUrl = null;
        if (request.containsKey("avatarBase64")) {
            avatarUrl = String.valueOf(request.get("avatarBase64"));
        } else if (request.containsKey("avatarUrl")) {
            avatarUrl = String.valueOf(request.get("avatarUrl"));
        }

        User updated = userService.updateProfile(authUser.getId(), name, avatarUrl);
        String token = jwtUtils.generateToken(updated);

        logger.info("Profile updated for user {}", updated.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "user", UserDto.fromEntity(updated),
                "token", token
        ));
    }
}
