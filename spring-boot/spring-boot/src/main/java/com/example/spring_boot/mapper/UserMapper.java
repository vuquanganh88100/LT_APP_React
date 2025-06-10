package com.example.spring_boot.mapper;

import com.example.spring_boot.dto.UserDto;
import com.example.spring_boot.entity.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class UserMapper {
    @Autowired
    PasswordEncoder passwordEncoder;
    public  UserEntity toEntity(UserDto userDto){
        UserEntity userEntity =new UserEntity();
        userEntity.setUserName(userDto.getUserName());
        userEntity.setEmail(userDto.getEmail());
        String hashPassword=passwordEncoder.encode(userDto.getPassword());
        userEntity.setPassword(hashPassword);
        userEntity.setCreatedAt(LocalDateTime.now());
        return  userEntity;
    }

    public UserDto toDto (UserEntity userEntity){
        UserDto userDto =new UserDto();
        userDto.setEmail(userEntity.getEmail());
        userDto.setUserName(userEntity.getUserName());
        userDto.setPassword(userEntity.getPassword());
        userDto.setUserId(userEntity.getUserId());
        return userDto;
    }
}
