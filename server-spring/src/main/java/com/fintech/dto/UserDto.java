package com.fintech.dto;

import com.fintech.entity.User;

public record UserDto(Long id, String email, String name, String avatarUrl) {

    public static UserDto fromEntity(User u) {
        if (u == null) return null;
        return new UserDto(u.getId(), u.getEmail(), u.getName(), u.getAvatarUrl());
    }
}
