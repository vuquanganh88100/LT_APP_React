package com.example.spring_boot.repository;

import com.example.spring_boot.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity,Integer> {
    List<TaskEntity> findByUserUserId(Integer userId);
}
