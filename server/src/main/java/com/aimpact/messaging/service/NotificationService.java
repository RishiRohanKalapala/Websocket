package com.aimpact.messaging.service;

import com.aimpact.messaging.dto.NotificationDTO;
import com.aimpact.messaging.dto.UserDTO;
import com.aimpact.messaging.model.Notification;
import com.aimpact.messaging.model.User;
import com.aimpact.messaging.repository.NotificationRepository;
import com.aimpact.messaging.websocket.NotificationMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    public List<NotificationDTO> getNotificationsForUser(Long userId) {
        User user = userService.getUserEntityById(userId);
        if (user == null) {
            return List.of();
        }
        
        return notificationRepository.findByRecipientOrderByTimestampDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<NotificationDTO> getUnreadNotificationsForUser(Long userId) {
        User user = userService.getUserEntityById(userId);
        if (user == null) {
            return List.of();
        }
        
        return notificationRepository.findByRecipientAndReadFalseOrderByTimestampDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public int countUnreadNotifications(Long userId) {
        User user = userService.getUserEntityById(userId);
        if (user == null) {
            return 0;
        }
        
        return notificationRepository.countUnreadNotifications(user);
    }
    
    public NotificationDTO markNotificationAsRead(Long notificationId, Long userId) {
        User user = userService.getUserEntityById(userId);
        if (user == null) {
            return null;
        }
        
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification == null || !notification.getRecipient().getId().equals(userId)) {
            return null;
        }
        
        notification.setRead(true);
        notification = notificationRepository.save(notification);
        
        return convertToDTO(notification);
    }
    
    public void sendNotification(NotificationMessage notificationMessage, Long senderId) {
        if (notificationMessage.getRecipientIds() == null || notificationMessage.getRecipientIds().isEmpty()) {
            return;
        }
        
        for (Long recipientId : notificationMessage.getRecipientIds()) {
            User recipient = userService.getUserEntityById(recipientId);
            if (recipient == null) {
                continue;
            }
            
            Notification notification = new Notification();
            notification.setRecipient(recipient);
            notification.setTitle(notificationMessage.getTitle());
            notification.setMessage(notificationMessage.getMessage());
            notification.setType(notificationMessage.getType());
            notification.setTimestamp(LocalDateTime.now());
            notification.setRead(false);
            
            notification = notificationRepository.save(notification);
            
            NotificationDTO notificationDTO = convertToDTO(notification);
            
            // Send notification to recipient via WebSocket
            messagingTemplate.convertAndSendToUser(
                    recipient.getId().toString(),
                    "/queue/notifications",
                    notificationDTO
            );
        }
    }
    
    public void sendNotificationToAll(NotificationMessage notificationMessage, Long senderId) {
        // Get all users
        List<UserDTO> users = userService.getAllUsers();
        
        for (UserDTO user : users) {
            if (user.getId().equals(senderId)) {
                continue; // Skip sender
            }
            
            User recipient = userService.getUserEntityById(user.getId());
            if (recipient == null) {
                continue;
            }
            
            Notification notification = new Notification();
            notification.setRecipient(recipient);
            notification.setTitle(notificationMessage.getTitle());
            notification.setMessage(notificationMessage.getMessage());
            notification.setType(notificationMessage.getType());
            notification.setTimestamp(LocalDateTime.now());
            notification.setRead(false);
            
            notification = notificationRepository.save(notification);
            
            NotificationDTO notificationDTO = convertToDTO(notification);
            
            // Send notification to recipient via WebSocket
            messagingTemplate.convertAndSendToUser(
                    recipient.getId().toString(),
                    "/queue/notifications",
                    notificationDTO
            );
        }
    }
    
    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setTimestamp(notification.getTimestamp());
        dto.setRead(notification.isRead());
        return dto;
    }
}