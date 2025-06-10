package com.example.spring_boot.repository;

import com.example.spring_boot.entity.CategoryEntity;
import org.springframework.beans.PropertyValues;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity,Integer> {
    List<CategoryEntity> findByUserUserId(int userId);
    boolean existsByUserUserIdAndName(int userId, String name);

}
