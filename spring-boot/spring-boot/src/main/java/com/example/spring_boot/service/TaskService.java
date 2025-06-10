package com.example.spring_boot.service;

import com.example.spring_boot.dto.TaskDto;
import com.example.spring_boot.entity.TaskEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public interface TaskService {
    List<TaskDto> getTasksByUserId(Integer userId);
    TaskDto createTask(TaskDto taskDto);
    Map<String, Map<String, Integer>> getTaskCountByCategoryAndStatus(Integer userId);
    TaskDto updateTask(int taskId,TaskDto dto);
}
