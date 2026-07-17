package com.athlon.tournament.tournament.service;

import com.athlon.tournament.dto.request.CategoryCreateRequest;
import com.athlon.tournament.dto.response.CategoryResponse;
import com.athlon.tournament.exception.ResourceNotFoundException;
import com.athlon.tournament.tournament.entity.Category;
import com.athlon.tournament.tournament.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        Category category = new Category(
                request.getTournamentId(),
                request.getTournamentUuid(),
                request.getName(),
                request.getDescription(),
                request.getSportType(),
                request.getMatchFormat(),
                request.getCreatedBy()
        );

        Category saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByTournamentId(Long tournamentId) {
        return categoryRepository.findByTournamentIdAndIsActiveTrue(tournamentId).stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryByUuid(UUID uuid) {
        Category category = categoryRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with UUID: " + uuid));
        return CategoryResponse.fromEntity(category);
    }
}
