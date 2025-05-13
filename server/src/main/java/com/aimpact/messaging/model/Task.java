package com.aimpact.messaging.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
public class Task {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "assignee_id", nullable = false)
    private User assignee;
    
    private LocalDateTime dueDate;
    
    private String priority;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private boolean completed;
}