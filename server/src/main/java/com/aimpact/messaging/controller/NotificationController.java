package com.aimpact.messaging.controller;

import com.aimpact.messaging.dto.NotificationDTO;
import com.aimpact.messaging.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotificationsForUser(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }
    
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotificationsForUser(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForUser(userId));
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Integer> countUnreadNotifications(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.countUnreadNotifications(userId));
    }
    
    @PostMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markNotificationAsRead(
            @PathVariable Long id,
            @RequestParam Long userId) {
        NotificationDTO notification = notificationService.markNotificationAsRead(id, userId);
        if (notification == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(notification);
    }
}