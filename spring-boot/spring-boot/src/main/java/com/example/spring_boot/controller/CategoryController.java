package com.example.spring_boot.controller;

import com.example.spring_boot.dto.CategoryDto;
import com.example.spring_boot.dto.UserDto;
import com.example.spring_boot.entity.UserEntity;
import com.example.spring_boot.service.CategoryService;
import com.example.spring_boot.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/schedule-manager/category")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;
    @Autowired
    private TaskService taskService;
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody CategoryDto categoryDto) {
        try {
            CategoryDto savedCategory= categoryService.createCategory(categoryDto);
            return ResponseEntity.ok(savedCategory);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
    @GetMapping
    public ResponseEntity<List<CategoryDto>> getCategories(@RequestParam int userId) {
        List<CategoryDto> categories = categoryService.getCategory(userId);
        Map<String, Map<String, Integer>> countTask = taskService.getTaskCountByCategoryAndStatus(userId);

        for (CategoryDto category : categories) {
            String categoryName = category.getName();
            Map<String, Integer> statusMap = countTask.getOrDefault(categoryName, new HashMap<>());

            category.setPendingCount(statusMap.getOrDefault("pending", 0));
            category.setDoneCount(statusMap.getOrDefault("done", 0));
            category.setInprogressCount(statusMap.getOrDefault("in_progress", 0));
        }
        return ResponseEntity.ok(categories);
    }

}
