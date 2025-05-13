package com.aimpact.messaging.controller;

import com.aimpact.messaging.dto.UserDTO;
import com.aimpact.messaging.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/online")
    public ResponseEntity<List<UserDTO>> getOnlineUsers() {
        return ResponseEntity.ok(userService.getOnlineUsers());
    }
    
    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        UserDTO user = userService.authenticateUser(email, password);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(user);
    }
    
    @PostMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> status) {
        Boolean isOnline = status.get("isOnline");
        if (isOnline == null) {
            return ResponseEntity.badRequest().build();
        }
        
        userService.updateUserStatus(id, isOnline);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/activity")
    public ResponseEntity<Void> updateActivity(@PathVariable Long id) {
        userService.updateUserActivity(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/logout")
    public ResponseEntity<Void> logout(@PathVariable Long id) {
        userService.logout(id);
        return ResponseEntity.ok().build();
    }
}