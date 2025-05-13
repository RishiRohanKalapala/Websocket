package com.aimpact.messaging.service;

import com.aimpact.messaging.dto.MessageDTO;
import com.aimpact.messaging.model.Conversation;
import com.aimpact.messaging.model.Message;
import com.aimpact.messaging.model.User;
import com.aimpact.messaging.repository.ConversationRepository;
import com.aimpact.messaging.repository.MessageRepository;
import com.aimpact.messaging.websocket.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    public List<MessageDTO> getMessagesForConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId).orElse(null);
        User user = userService.getUserEntityById(userId);
        
        if (conversation == null || user == null) {
            return List.of();
        }
        
        // Mark messages as read
        List<Message> messages = messageRepository.findByConversationOrderByTimestampAsc(conversation);
        messages.forEach(message -> {
            if (message.getRecipient().getId().equals(userId) && !message.isRead()) {
                message.setRead(true);
                messageRepository.save(message);
            }
        });
        
        return messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public MessageDTO sendMessage(ChatMessage chatMessage, Long senderId) {
        User sender = userService.getUserEntityById(senderId);
        User recipient = userService.getUserEntityById(chatMessage.getRecipientId());
        Conversation conversation = conversationRepository.findById(chatMessage.getConversationId()).orElse(null);
        
        if (sender == null || recipient == null || conversation == null) {
            return null;
        }
        
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setText(chatMessage.getText());
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);
        
        message = messageRepository.save(message);
        
        // Update conversation last message time
        conversation.setLastMessageAt(message.getTimestamp());
        conversationRepository.save(conversation);
        
        MessageDTO messageDTO = convertToDTO(message);
        
        // Send message to recipient via WebSocket
        messagingTemplate.convertAndSendToUser(
                recipient.getId().toString(),
                "/queue/messages",
                messageDTO
        );
        
        return messageDTO;
    }
    
    public int countUnreadMessages(Long userId) {
        User user = userService.getUserEntityById(userId);
        if (user == null) {
            return 0;
        }
        
        return messageRepository.countUnreadMessages(user);
    }
    
    public int countUnreadMessagesInConversation(Long conversationId, Long userId) {
        User user = userService.getUserEntityById(userId);
        Conversation conversation = conversationRepository.findById(conversationId).orElse(null);
        
        if (user == null || conversation == null) {
            return 0;
        }
        
        return messageRepository.countUnreadMessagesInConversation(conversation, user);
    }
    
    public void markMessagesAsRead(Long conversationId, Long userId) {
        User user = userService.getUserEntityById(userId);
        Conversation conversation = conversationRepository.findById(conversationId).orElse(null);
        
        if (user == null || conversation == null) {
            return;
        }
        
        List<Message> messages = messageRepository.findByConversationOrderByTimestampAsc(conversation);
        messages.forEach(message -> {
            if (message.getRecipient().getId().equals(userId) && !message.isRead()) {
                message.setRead(true);
                messageRepository.save(message);
            }
        });
    }
    
    private MessageDTO convertToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setConversationId(message.getConversation().getId());
        dto.setSenderId(message.getSender().getId());
        dto.setRecipientId(message.getRecipient().getId());
        dto.setText(message.getText());
        dto.setTimestamp(message.getTimestamp());
        dto.setRead(message.isRead());
        return dto;
    }
}