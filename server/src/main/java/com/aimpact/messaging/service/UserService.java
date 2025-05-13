package com.aimpact.messaging.service;

import com.aimpact.messaging.dto.UserDTO;
import com.aimpact.messaging.model.User;
import com.aimpact.messaging.repository.MessageRepository;
import com.aimpact.messaging.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private MessageRepository messageRepository;
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    public UserDTO getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    public List<UserDTO> getOnlineUsers() {
        return userRepository.findByIsOnlineTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public UserDTO authenticateUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // For simplicity, we're using plain text comparison
            // In a real app, use passwordEncoder.matches(password, user.getPassword())
            if (password.equals(user.getPassword())) {
                user.setLastLogin(LocalDateTime.now());
                user.setLastActive(LocalDateTime.now());
                user.setOnline(true);
                userRepository.save(user);
                
                return convertToDTO(user);
            }
        }
        
        return null;
    }
    
    public void updateUserStatus(Long userId, boolean isOnline) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setOnline(isOnline);
            user.setLastActive(LocalDateTime.now());
            userRepository.save(user);
        });
    }
    
    public void updateUserActivity(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastActive(LocalDateTime.now());
            userRepository.save(user);
        });
    }
    
    public void logout(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setOnline(false);
            userRepository.save(user);
        });
    }
    
    public User getUserEntityById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setAvatar(user.getAvatar());
        dto.setRole(user.getRole());
        dto.setLastLogin(user.getLastLogin());
        dto.setLastActive(user.getLastActive());
        dto.setOnline(user.isOnline());
        
        // Get unread messages count
        int unreadCount = messageRepository.countUnreadMessages(user);
        dto.setUnreadMessages(unreadCount);
        
        return dto;
    }
}