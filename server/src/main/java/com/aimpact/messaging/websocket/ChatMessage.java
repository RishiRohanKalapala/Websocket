package com.aimpact.messaging.websocket;

import lombok.Data;

@Data
public class ChatMessage {
    private Long conversationId;
    private Long recipientId;
    private String text;
}