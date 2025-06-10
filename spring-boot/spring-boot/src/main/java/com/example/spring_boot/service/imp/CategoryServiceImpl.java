package com.example.spring_boot.service.imp;

import com.example.spring_boot.dto.CategoryDto;
import com.example.spring_boot.dto.UserDto;
import com.example.spring_boot.entity.CategoryEntity;
import com.example.spring_boot.mapper.CategoryMapper;
import com.example.spring_boot.repository.CategoryRepository;
import com.example.spring_boot.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    CategoryRepository categoryRepository;
    @Autowired
    CategoryMapper categoryMapper;


    @Override
    public void createDefaultCategories(CategoryDto categoryDto) {
        String[] defaultCategories = {"Personal", "Work", "Grocery List"};
        for (String categoryName : defaultCategories) {
            categoryDto.setName(categoryName);
            CategoryEntity categoryEntity=categoryMapper.toEntity(categoryDto);
            categoryRepository.save(categoryEntity);
        }
    }

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto) {


        if (categoryRepository.existsByUserUserIdAndName(categoryDto.getUserId(), categoryDto.getName())) {
            throw new RuntimeException("Category name already exists for this user");
        }

        CategoryEntity category = categoryMapper.toEntity(categoryDto);
        category = categoryRepository.save(category);
        return categoryMapper.toDto(category);
    }

    @Override
    public List<CategoryDto> getCategory(int userId) {

        return categoryRepository.findByUserUserId(userId)
                .stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }
}
