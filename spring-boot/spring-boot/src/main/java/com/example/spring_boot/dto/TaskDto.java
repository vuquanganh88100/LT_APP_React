package com.example.spring_boot.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskDto {
    private int taskId;
    private int categoryId;
    private CategoryDto category;
    private String title;
    private String description;
    private String priority;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime createdTime;

    private int userId;
}
