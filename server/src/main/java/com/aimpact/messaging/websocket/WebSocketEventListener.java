package com.aimpact.messaging.websocket;

import com.aimpact.messaging.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);
    
    @Autowired
    private UserService userService;
    
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        // Get user ID from session attributes
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");
        
        if (userId != null) {
            logger.info("User connected: {}", userId);
            
            // Update user status to online
            userService.updateUserStatus(userId, true);
        }
    }
    
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        // Get user ID from session attributes
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");
        
        if (userId != null) {
            logger.info("User disconnected: {}", userId);
            
            // Update user status to offline
            userService.updateUserStatus(userId, false);
        }
    }
}