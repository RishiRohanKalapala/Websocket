package com.aimpact.messaging.config;

import com.aimpact.messaging.model.User;
import com.aimpact.messaging.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Create initial users if none exist
        if (userRepository.count() == 0) {
            List<User> users = Arrays.asList(
                    createUser("admin@aimpact.com", "Admin@123", "Admin User", "admin"),
                    createUser("frontend@aimpact.com", "Frontend@123", "Frontend Developer", "frontend"),
                    createUser("medical@aimpact.com", "Medical@123", "Medical Advisor", "medical"),
                    createUser("designer@aimpact.com", "Designer@123", "UI/UX Designer", "designer"),
                    createUser("java@aimpact.com", "Java@123", "Java Developer", "java"),
                    createUser("database@aimpact.com", "Database@123", "Database Admin", "database"),
                    createUser("homeo@aimpact.com", "Homeo@123", "Homeo Advisor", "homeo")
            );
            
            userRepository.saveAll(users);
        }
    }
    
    private User createUser(String email, String password, String name, String role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(password); // In a real app, use passwordEncoder.encode(password)
        user.setName(name);
        user.setRole(role);
        user.setAvatar("https://ui-avatars.com/api/?name=" + name.replace(" ", "+") + "&background=random");
        user.setLastLogin(LocalDateTime.now());
        user.setLastActive(LocalDateTime.now());
        user.setOnline(false);
        return user;
    }
}