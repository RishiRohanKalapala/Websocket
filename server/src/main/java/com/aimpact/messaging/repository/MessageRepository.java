package com.aimpact.messaging.repository;

import com.aimpact.messaging.model.Conversation;
import com.aimpact.messaging.model.Message;
import com.aimpact.messaging.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByConversationOrderByTimestampAsc(Conversation conversation);
    
    List<Message> findByRecipientAndReadFalse(User recipient);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.recipient = :recipient AND m.read = false")
    int countUnreadMessages(@Param("recipient") User recipient);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation = :conversation AND m.recipient = :recipient AND m.read = false")
    int countUnreadMessagesInConversation(@Param("conversation") Conversation conversation, @Param("recipient") User recipient);
}