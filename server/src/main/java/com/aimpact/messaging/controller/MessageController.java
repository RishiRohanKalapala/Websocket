package com.aimpact.messaging.controller;

import com.aimpact.messaging.dto.MessageDTO;
import com.aimpact.messaging.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getMessagesForConversation(
            @PathVariable Long conversationId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(messageService.getMessagesForConversation(conversationId, userId));
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Integer> countUnreadMessages(@RequestParam Long userId) {
        return ResponseEntity.ok(messageService.countUnreadMessages(userId));
    }
    
    @GetMapping("/unread/count/conversation/{conversationId}")
    public ResponseEntity<Integer> countUnreadMessagesInConversation(
            @PathVariable Long conversationId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(messageService.countUnreadMessagesInConversation(conversationId, userId));
    }
    
    @PostMapping("/read/conversation/{conversationId}")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable Long conversationId,
            @RequestParam Long userId) {
        messageService.markMessagesAsRead(conversationId, userId);
        return ResponseEntity.ok().build();
    }
}