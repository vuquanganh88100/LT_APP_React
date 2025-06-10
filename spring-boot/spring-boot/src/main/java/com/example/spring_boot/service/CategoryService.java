package com.example.spring_boot.service;

import com.example.spring_boot.dto.CategoryDto;
import com.example.spring_boot.dto.UserDto;
import com.example.spring_boot.entity.CategoryEntity;

import java.util.List;

public interface CategoryService {
    void createDefaultCategories(CategoryDto categoryDto);
    CategoryDto createCategory(CategoryDto categoryDto);
    List<CategoryDto> getCategory(int userId);
}
