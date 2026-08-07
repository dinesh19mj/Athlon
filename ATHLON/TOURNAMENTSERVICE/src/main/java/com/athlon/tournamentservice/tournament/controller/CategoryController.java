package com.athlon.tournamentservice.tournament.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.tournamentservice.dto.request.TournamentCategoryCreateRequest;
import com.athlon.tournamentservice.dto.response.ApiResponse;
import com.athlon.tournamentservice.dto.response.TournamentCategoryResponse;
import com.athlon.tournamentservice.tournament.service.TournamentCategoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tournament/categories")
public class CategoryController {

	private final TournamentCategoryService categoryService;

	public CategoryController(TournamentCategoryService categoryService) {
		this.categoryService = categoryService;
	}

	@PostMapping("/createCategory")
	public ResponseEntity<ApiResponse<TournamentCategoryResponse>> createCategory(
			@Valid @RequestBody TournamentCategoryCreateRequest request) {

		TournamentCategoryResponse response = categoryService.createCategory(request);

		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Category created successfully", response));
	}

	@GetMapping("getCategoryByUuid/{categoryUuid}")
	public ResponseEntity<ApiResponse<TournamentCategoryResponse>> getCategoryByUuid(@PathVariable("categoryUuid") UUID categoryUuid) {

		TournamentCategoryResponse response = categoryService.getCategoryByUuid(categoryUuid);

		return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", response));
	}

	@GetMapping("/organization/{organizationId}")
	public ResponseEntity<ApiResponse<List<TournamentCategoryResponse>>> getCategoriesByOrganizationId(
			@PathVariable("organizationId") Long organizationId) {

		List<TournamentCategoryResponse> response = categoryService.getCategoriesByOrganizationId(organizationId);

		return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", response));
	}

}
