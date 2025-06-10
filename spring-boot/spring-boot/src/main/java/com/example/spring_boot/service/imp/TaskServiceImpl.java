package com.example.spring_boot.service.imp;

import com.example.spring_boot.dto.TaskDto;
import com.example.spring_boot.entity.TaskEntity;
import com.example.spring_boot.mapper.TaskMapper;
import com.example.spring_boot.repository.TaskRepository;
import com.example.spring_boot.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.config.Task;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
    public TaskDto createTask(TaskDto taskDto) {
        TaskEntity taskEntity=taskMapper.toEntity(taskDto);
         taskRepository.save(taskEntity);
        return taskMapper.toDto(taskEntity);
    }
}
