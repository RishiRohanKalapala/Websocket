package com.aimpact.messaging.repository;

import com.aimpact.messaging.model.Notification;
import com.aimpact.messaging.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByRecipientOrderByTimestampDesc(User recipient);
    
    List<Notification> findByRecipientAndReadFalseOrderByTimestampDesc(User recipient);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient = :recipient AND n.read = false")
    int countUnreadNotifications(@Param("recipient") User recipient);
}