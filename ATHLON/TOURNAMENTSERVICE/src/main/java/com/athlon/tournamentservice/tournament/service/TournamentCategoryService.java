package com.athlon.tournamentservice.tournament.service;

import com.athlon.tournamentservice.dto.request.TournamentCategoryCreateRequest;
import com.athlon.tournamentservice.dto.response.TournamentCategoryResponse;
import com.athlon.tournamentservice.exception.ResourceNotFoundException;
import com.athlon.tournamentservice.tournament.entity.TournamentCategory;
import com.athlon.tournamentservice.tournament.repository.TournamentCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TournamentCategoryService {

	private final TournamentCategoryRepository categoryRepository;

	public TournamentCategoryService(TournamentCategoryRepository categoryRepository) {
		this.categoryRepository = categoryRepository;
	}

	@Transactional
	public TournamentCategoryResponse createCategory(TournamentCategoryCreateRequest request) {

		TournamentCategory category = new TournamentCategory(request.getOrganizationId(), request.getOrganizationUuid(),
				request.getSportType(), request.getCategoryName(), request.getCreatedBy());

		TournamentCategory saved = categoryRepository.save(category);

		return TournamentCategoryResponse.fromEntity(saved);
	}

	@Transactional(readOnly = true)
	public List<TournamentCategoryResponse> getCategoriesByOrganizationId(Long organizationId) {

		return categoryRepository.findByOrganizationIdAndIsActive(organizationId, 1).stream()
				.map(TournamentCategoryResponse::fromEntity).collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public TournamentCategoryResponse getCategoryByUuid(UUID categoryUuid) {

		TournamentCategory category = categoryRepository.findByCategoryUuid(categoryUuid)
				.orElseThrow(() -> new ResourceNotFoundException("Category not found with UUID : " + categoryUuid));

		return TournamentCategoryResponse.fromEntity(category);
	}
}
