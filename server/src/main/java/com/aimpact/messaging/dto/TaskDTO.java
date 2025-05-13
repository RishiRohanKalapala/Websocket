package com.aimpact.messaging.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskDTO {
    private Long id;
    private String title;
    private String description;
    private Long assigneeId;
    private LocalDateTime dueDate;
    private String priority;
    private LocalDateTime createdAt;
    private boolean completed;
}