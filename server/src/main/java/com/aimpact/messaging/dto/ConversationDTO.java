package com.aimpact.messaging.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ConversationDTO {
    private Long id;
    private List<UserDTO> participants;
    private MessageDTO lastMessage;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private int unreadCount;
}