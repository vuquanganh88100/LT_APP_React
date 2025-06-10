package com.example.spring_boot.dto;

import jdk.jfr.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDto {
    private int categoryId;
    private String name;
    private int userId;
    private int pendingCount;
    private int doneCount;
    private int inprogressCount;
}
