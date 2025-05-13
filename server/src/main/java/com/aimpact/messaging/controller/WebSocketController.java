package com.aimpact.messaging.controller;

import com.aimpact.messaging.dto.MessageDTO;
import com.aimpact.messaging.service.MessageService;
import com.aimpact.messaging.service.NotificationService;
import com.aimpact.messaging.websocket.ChatMessage;
import com.aimpact.messaging.websocket.NotificationMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class WebSocketController {
    
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private NotificationService notificationService;
    
    @MessageMapping("/chat.sendMessage")
    public MessageDTO sendMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Get user ID from session attributes
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");
        
        return messageService.sendMessage(chatMessage, userId);
    }
    
    @MessageMapping("/notification.send")
    public void sendNotification(@Payload NotificationMessage notificationMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Get user ID from session attributes
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");
        
        notificationService.sendNotification(notificationMessage, userId);
    }
    
    @MessageMapping("/notification.sendToAll")
    public void sendNotificationToAll(@Payload NotificationMessage notificationMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Get user ID from session attributes
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");
        
        notificationService.sendNotificationToAll(notificationMessage, userId);
    }
}