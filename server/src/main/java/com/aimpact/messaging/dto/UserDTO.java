package com.aimpact.messaging.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String avatar;
    private String role;
    private LocalDateTime lastLogin;
    private LocalDateTime lastActive;
    private boolean isOnline;
    private int unreadMessages;
}