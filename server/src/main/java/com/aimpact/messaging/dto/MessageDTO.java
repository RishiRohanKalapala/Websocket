package com.aimpact.messaging.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private Long recipientId;
    private String text;
    private LocalDateTime timestamp;
    private boolean read;
}