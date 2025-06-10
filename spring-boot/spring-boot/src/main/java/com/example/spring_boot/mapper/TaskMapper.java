package com.example.spring_boot.mapper;

import com.example.spring_boot.dto.TaskDto;
import com.example.spring_boot.entity.Priority;
import com.example.spring_boot.entity.Status;
import com.example.spring_boot.entity.TaskEntity;
import com.example.spring_boot.repository.CategoryRepository;
import com.example.spring_boot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TaskMapper {
    @Autowired
    CategoryRepository categoryRepository;
    @Autowired
    UserRepository userRepository;
    public TaskEntity toEntity(TaskDto taskDto){
        TaskEntity taskEntity=new TaskEntity();
        taskEntity.setDescription(taskDto.getDescription());
        taskEntity.setStatus(Status.valueOf(taskDto.getStatus()));
        taskEntity.setPriority(Priority.valueOf(taskDto.getPriority()));
        taskEntity.setTitle(taskDto.getTitle());
        taskEntity.setStartTime(taskDto.getStartTime());
        taskEntity.setCategory(categoryRepository.findById(taskDto.getCategoryId()).get());
        taskEntity.setUser(userRepository.findById(taskDto.getUserId()).get());
        return taskEntity;
    }
    public TaskDto toDto(TaskEntity taskEntity) {
        TaskDto taskDto = new TaskDto();
        taskDto.setTaskId(taskEntity.getTaskId());
        taskDto.setCategoryId(taskEntity.getCategory().getCategoryId());
        taskDto.setTitle(taskEntity.getTitle());
        taskDto.setDescription(taskEntity.getDescription());
        taskDto.setStatus(taskEntity.getStatus().name());
        taskDto.setPriority(taskEntity.getPriority().name());
        taskDto.setStartTime(taskEntity.getStartTime());
        taskDto.setUserId(taskEntity.getUser().getUserId());
        taskDto.setCreatedTime(taskEntity.getCreatedAt());
        return taskDto;
    }
}
