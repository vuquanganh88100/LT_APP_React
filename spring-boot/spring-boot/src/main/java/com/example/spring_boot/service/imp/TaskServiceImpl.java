package com.example.spring_boot.service.imp;

import com.example.spring_boot.dto.TaskDto;
import com.example.spring_boot.entity.Priority;
import com.example.spring_boot.entity.Status;
import com.example.spring_boot.entity.TaskEntity;
import com.example.spring_boot.mapper.TaskMapper;
import com.example.spring_boot.repository.TaskRepository;
import com.example.spring_boot.service.TaskService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.config.Task;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TaskServiceImpl implements TaskService {
    @Autowired
    TaskMapper taskMapper;
    @Autowired
    TaskRepository taskRepository;
    @Override
    public List<TaskDto> getTasksByUserId(Integer userId) {
        List<TaskEntity> taskEntities=taskRepository.findByUserUserId(userId);
        List<TaskDto>taskDtos=new ArrayList<>();
        for(TaskEntity task:taskEntities){
            TaskDto taskDto=taskMapper.toDto(task);
            taskDtos.add(taskDto);
        }
        return  taskDtos;
    }

    @Override
    public List<TaskDto> getTasksByUserIdAndDate(Integer userId, String date) {
        List<TaskEntity> taskEntities = taskRepository.findByUserUserId(userId);
        List<TaskDto> taskDtos = new ArrayList<>();
        
        // Parse the input date (format: yyyy-MM-dd)
        LocalDate targetDate = LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        
        for(TaskEntity task : taskEntities) {
            // Check if task has a start time and matches the target date
            if (task.getStartTime() != null) {
                LocalDate taskDate = task.getStartTime().toLocalDate();
                if (taskDate.equals(targetDate)) {
                    TaskDto taskDto = taskMapper.toDto(task);
                    taskDtos.add(taskDto);
                }
            }
        }
        
        return taskDtos;
    }

    @Override
    public TaskDto createTask(TaskDto taskDto) {
        TaskEntity taskEntity=taskMapper.toEntity(taskDto);
        taskEntity.setCreatedAt(LocalDateTime.now());
        taskRepository.save(taskEntity);
        return taskMapper.toDto(taskEntity);
    }
    public Map<String, Map<String, Integer>> getTaskCountByCategoryAndStatus(Integer userId) {
        List<TaskEntity> taskEntities = taskRepository.findByUserUserId(userId);

        Map<String, Map<String, Integer>> result = new HashMap<>();

        for (TaskEntity task : taskEntities) {
            String categoryName = task.getCategory().getName();
            String status = String.valueOf(task.getStatus());
            result.putIfAbsent(categoryName, new HashMap<>());

            Map<String, Integer> statusMap = result.get(categoryName);
            statusMap.put("pending", statusMap.getOrDefault("pending", 0));
            statusMap.put("done", statusMap.getOrDefault("done", 0));
            statusMap.put("in_progress", statusMap.getOrDefault("in_progress", 0));

            if (status.equals("pending")) {
                statusMap.put("pending", statusMap.get("pending") + 1);
            } else if (status.equals("done")) {
                statusMap.put("done", statusMap.get("done") + 1);
            } else if (status.equals("in_progress")) {
                statusMap.put("in_progress", statusMap.get("in_progress") + 1);
            }
        }

        return result;
    }

    @Override
    public TaskDto updateTask(int taskId, TaskDto dto) {
        LocalDateTime tempCreated=taskRepository.findById(taskId).get().getCreatedAt();
        TaskEntity updatedTask = taskMapper.toEntity(dto);
        updatedTask.setCreatedAt(tempCreated);
        updatedTask.setTaskId(taskId);
        taskRepository.save(updatedTask);
        return taskMapper.toDto(updatedTask);
    }


}
