package com.example.spring_boot.mapper;

import com.example.spring_boot.dto.CategoryDto;
import com.example.spring_boot.entity.CategoryEntity;
import com.example.spring_boot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class CategoryMapper {
    @Autowired
    UserRepository userRepository;
    public CategoryEntity toEntity(CategoryDto categoryDto){
        CategoryEntity categoryEntity=new CategoryEntity();
        categoryEntity.setName(categoryDto.getName());
        categoryEntity.setCreatedAt(LocalDateTime.now());
        categoryEntity.setUser(userRepository.findById(categoryDto.getUserId()).get());
        return  categoryEntity;
    }
    public CategoryDto toDto(CategoryEntity categoryEntity){
        CategoryDto categoryDto=new CategoryDto();
        categoryDto.setCategoryId(categoryEntity.getCategoryId());
        categoryDto.setName(categoryEntity.getName());
        categoryDto.setUserId(categoryEntity.getUser().getUserId());
        return  categoryDto;
    }
}
