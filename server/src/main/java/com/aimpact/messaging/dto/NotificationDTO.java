package com.aimpact.messaging.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private LocalDateTime timestamp;
    private boolean read;
}