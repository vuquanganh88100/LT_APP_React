package com.example.spring_boot.service.imp;

import com.example.spring_boot.dto.CategoryDto;
import com.example.spring_boot.dto.UserDto;
import com.example.spring_boot.entity.UserEntity;
import com.example.spring_boot.mapper.UserMapper;
import com.example.spring_boot.repository.UserRepository;
import com.example.spring_boot.service.CategoryService;
import com.example.spring_boot.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    UserMapper userMapper;
    @Autowired
    UserRepository userRepository;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    CategoryService categoryService;
    @Override
    public UserEntity register(UserDto userDto) {
        if (userRepository.existsByUserName(userDto.getUserName())) {
            throw new RuntimeException("Username already taken!");
        }
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }
        UserEntity userEntity=userMapper.toEntity(userDto);
        userEntity=userRepository.save(userEntity);
        CategoryDto categoryDto=new CategoryDto();
        categoryDto.setUserId(userEntity.getUserId());
        categoryService.createDefaultCategories(categoryDto);
        return userEntity;
    }

    public UserDto login(String userName, String rawPassword) {
        Optional<UserEntity> userOpt = userRepository.findByUserName(userName);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid username");
        }

        UserEntity user = userOpt.get();

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return userMapper.toDto(user);
    }
}