package com.athlon.tournament.tournament.controller;

import com.athlon.tournament.dto.request.CategoryCreateRequest;
import com.athlon.tournament.dto.response.ApiResponse;
import com.athlon.tournament.dto.response.CategoryResponse;
import com.athlon.tournament.tournament.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tournament/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return new ResponseEntity<>(ApiResponse.success("Category created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/get/{uuid}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryByUuid(@PathVariable UUID uuid) {
        CategoryResponse response = categoryService.getCategoryByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", response));
    }

    @GetMapping("/get-by-tournament")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesByTournamentId(@RequestParam("tournamentId") Long tournamentId) {
        List<CategoryResponse> response = categoryService.getCategoriesByTournamentId(tournamentId);
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", response));
    }
}
