package com.aimpact.messaging.service;

import com.aimpact.messaging.dto.ConversationDTO;
import com.aimpact.messaging.dto.MessageDTO;
import com.aimpact.messaging.dto.UserDTO;
import com.aimpact.messaging.model.Conversation;
import com.aimpact.messaging.model.Message;
import com.aimpact.messaging.model.User;
import com.aimpact.messaging.repository.ConversationRepository;
import com.aimpact.messaging.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ConversationService {
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private UserService userService;
    
    public List<ConversationDTO> getConversationsForUser(Long userId) {
        User user = userService.getUserEntityById(userId);
        if (user == null) {
            return List.of();
        }
        
        List<Conversation> conversations = conversationRepository.findByParticipant(user);
        
        return conversations.stream()
                .map(conversation -> convertToDTO(conversation, userId))
                .sorted(Comparator.comparing(ConversationDTO::getLastMessageAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }
    
    public ConversationDTO getOrCreateConversation(Long userId1, Long userId2) {
        User user1 = userService.getUserEntityById(userId1);
        User user2 = userService.getUserEntityById(userId2);
        
        if (user1 == null || user2 == null) {
            return null;
        }
        
        // Check if conversation already exists
        Optional<Conversation> existingConversation = conversationRepository.findByTwoParticipants(user1, user2);
        
        if (existingConversation.isPresent()) {
            return convertToDTO(existingConversation.get(), userId1);
        }
        
        // Create new conversation
        Conversation conversation = new Conversation();
        conversation.setParticipants(List.of(user1, user2));
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setLastMessageAt(LocalDateTime.now());
        
        conversation = conversationRepository.save(conversation);
        
        return convertToDTO(conversation, userId1);
    }
    
    public List<ConversationDTO> getAllConversations() {
        List<Conversation> conversations = conversationRepository.findAll();
        
        return conversations.stream()
                .map(conversation -> {
                    ConversationDTO dto = new ConversationDTO();
                    dto.setId(conversation.getId());
                    
                    // Convert participants
                    List<UserDTO> participants = conversation.getParticipants().stream()
                            .map(user -> userService.getUserById(user.getId()))
                            .collect(Collectors.toList());
                    dto.setParticipants(participants);
                    
                    // Get last message
                    List<Message> messages = messageRepository.findByConversationOrderByTimestampAsc(conversation);
                    if (!messages.isEmpty()) {
                        Message lastMessage = messages.get(messages.size() - 1);
                        MessageDTO lastMessageDTO = new MessageDTO();
                        lastMessageDTO.setId(lastMessage.getId());
                        lastMessageDTO.setConversationId(lastMessage.getConversation().getId());
                        lastMessageDTO.setSenderId(lastMessage.getSender().getId());
                        lastMessageDTO.setRecipientId(lastMessage.getRecipient().getId());
                        lastMessageDTO.setText(lastMessage.getText());
                        lastMessageDTO.setTimestamp(lastMessage.getTimestamp());
                        lastMessageDTO.setRead(lastMessage.isRead());
                        
                        dto.setLastMessage(lastMessageDTO);
                        dto.setLastMessageAt(lastMessage.getTimestamp());
                    } else {
                        dto.setLastMessageAt(conversation.getCreatedAt());
                    }
                    
                    dto.setCreatedAt(conversation.getCreatedAt());
                    dto.setUnreadCount(messages.size());
                    
                    return dto;
                })
                .sorted(Comparator.comparing(ConversationDTO::getLastMessageAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }
    
    private ConversationDTO convertToDTO(Conversation conversation, Long currentUserId) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        
        // Get other participant
        List<UserDTO> participants = new ArrayList<>();
        for (User participant : conversation.getParticipants()) {
            if (!participant.getId().equals(currentUserId)) {
                participants.add(userService.getUserById(participant.getId()));
            }
        }
        dto.setParticipants(participants);
        
        // Get last message
        List<Message> messages = messageRepository.findByConversationOrderByTimestampAsc(conversation);
        if (!messages.isEmpty()) {
            Message lastMessage = messages.get(messages.size() - 1);
            MessageDTO lastMessageDTO = new MessageDTO();
            lastMessageDTO.setId(lastMessage.getId());
            lastMessageDTO.setConversationId(lastMessage.getConversation().getId());
            lastMessageDTO.setSenderId(lastMessage.getSender().getId());
            lastMessageDTO.setRecipientId(lastMessage.getRecipient().getId());
            lastMessageDTO.setText(lastMessage.getText());
            lastMessageDTO.setTimestamp(lastMessage.getTimestamp());
            lastMessageDTO.setRead(lastMessage.isRead());
            
            dto.setLastMessage(lastMessageDTO);
            dto.setLastMessageAt(lastMessage.getTimestamp());
        } else {
            dto.setLastMessageAt(conversation.getCreatedAt());
        }
        
        dto.setCreatedAt(conversation.getCreatedAt());
        
        // Count unread messages
        User currentUser = userService.getUserEntityById(currentUserId);
        int unreadCount = messageRepository.countUnreadMessagesInConversation(conversation, currentUser);
        dto.setUnreadCount(unreadCount);
        
        return dto;
    }
}