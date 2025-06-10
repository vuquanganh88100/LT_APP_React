package com.example.spring_boot.controller;

import com.example.spring_boot.dto.CategoryDto;
import com.example.spring_boot.dto.UserDto;
import com.example.spring_boot.entity.UserEntity;
import com.example.spring_boot.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedule-manager/category")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;
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
        return ResponseEntity.ok(categories);
    }
}
