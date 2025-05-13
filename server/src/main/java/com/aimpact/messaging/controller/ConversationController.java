package com.aimpact.messaging.controller;

import com.aimpact.messaging.dto.ConversationDTO;
import com.aimpact.messaging.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = "*")
public class ConversationController {
    
    @Autowired
    private ConversationService conversationService;
    
    @GetMapping
    public ResponseEntity<List<ConversationDTO>> getConversationsForUser(@RequestParam Long userId) {
        return ResponseEntity.ok(conversationService.getConversationsForUser(userId));
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<ConversationDTO>> getAllConversations() {
        return ResponseEntity.ok(conversationService.getAllConversations());
    }
    
    @PostMapping
    public ResponseEntity<ConversationDTO> getOrCreateConversation(@RequestBody Map<String, Long> participants) {
        Long userId1 = participants.get("userId1");
        Long userId2 = participants.get("userId2");
        
        if (userId1 == null || userId2 == null) {
            return ResponseEntity.badRequest().build();
        }
        
        ConversationDTO conversation = conversationService.getOrCreateConversation(userId1, userId2);
        if (conversation == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(conversation);
    }
}