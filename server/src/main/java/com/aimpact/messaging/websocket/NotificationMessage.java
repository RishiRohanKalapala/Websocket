package com.aimpact.messaging.websocket;

import lombok.Data;

import java.util.List;

@Data
public class NotificationMessage {
    private String title;
    private String message;
    private String type;
    private List<Long> recipientIds;
}