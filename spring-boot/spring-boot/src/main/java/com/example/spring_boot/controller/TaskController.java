package com.example.spring_boot.controller;

import com.example.spring_boot.dto.CategoryDto;
import com.example.spring_boot.dto.TaskDto;
import com.example.spring_boot.service.CategoryService;
import com.example.spring_boot.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/schedule-manager/task")
public class TaskController {
    @Autowired
    private TaskService taskService;
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody TaskDto taskDto) {
        try {
            TaskDto savedTask= taskService.createTask(taskDto);
            return ResponseEntity.ok(savedTask);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
    @GetMapping
    public ResponseEntity<List<TaskDto>> getTask(@RequestParam int userId) {
        List<TaskDto> taskDtos = taskService.getTasksByUserId(userId);
        return ResponseEntity.ok(taskDtos);
    }
    
    @GetMapping("/by-date")
    public ResponseEntity<List<TaskDto>> getTasksByDate(
            @RequestParam int userId,
            @RequestParam String date) {
        List<TaskDto> taskDtos = taskService.getTasksByUserIdAndDate(userId, date);
        return ResponseEntity.ok(taskDtos);
    }
    @GetMapping("/count")
    public ResponseEntity<Map<String, Map<String, Integer>>> getCountTask(@RequestParam int userId) {
        Map<String,Map<String,Integer>> getTaskCount=taskService.getTaskCountByCategoryAndStatus(userId);
        return ResponseEntity.ok(getTaskCount);
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Map<String, Integer>>> getTaskStatistics(@RequestParam int userId) {
        Map<String,Map<String,Integer>> statistics = taskService.getTaskStatisticsForCharts(userId);
        return ResponseEntity.ok(statistics);
    }
    @PutMapping("/{taskId}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable int taskId,
            @RequestBody TaskDto dto
    ) {
        TaskDto updatedTask = taskService.updateTask(taskId, dto);
        return ResponseEntity.ok(updatedTask);
    }

}
