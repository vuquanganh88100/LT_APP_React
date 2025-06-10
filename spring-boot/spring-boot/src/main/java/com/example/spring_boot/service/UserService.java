package com.example.spring_boot.service;

import com.example.spring_boot.dto.UserDto;
import com.example.spring_boot.entity.UserEntity;
import org.springframework.stereotype.Service;

@Service
public interface UserService {
    UserEntity register(UserDto userDto);
    UserDto login(String userName, String password);
}
