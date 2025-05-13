package com.aimpact.messaging.websocket;

import lombok.Data;

@Data
public class WebSocketMessage {
    private String type;
    private Object payload;
}