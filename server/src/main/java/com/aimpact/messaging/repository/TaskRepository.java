package com.aimpact.messaging.repository;

import com.aimpact.messaging.model.Task;
import com.aimpact.messaging.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByAssigneeOrderByDueDateAsc(User assignee);
    
    List<Task> findByAssigneeAndCompletedFalseOrderByDueDateAsc(User assignee);
}