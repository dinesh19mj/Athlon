package com.athlon.identityservice.security.service;

import com.athlon.identityservice.security.dto.request.CreatePermissionRequest;
import com.athlon.identityservice.security.dto.response.PermissionResponse;
import com.athlon.identityservice.security.entity.Permission;
import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.security.repository.PermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @Transactional
    public PermissionResponse createPermission(CreatePermissionRequest request, Long currentUserId) {
        if (permissionRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Permission already exists with name: " + request.getName());
        }

        Permission permission = new Permission(request.getName(), request.getDescription(), currentUserId);
        permission = permissionRepository.save(permission);

        return mapToResponse(permission);
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PermissionResponse mapToResponse(Permission permission) {
        PermissionResponse response = new PermissionResponse();
        response.setUuid(permission.getUuid());
        response.setName(permission.getName());
        response.setDescription(permission.getDescription());
        response.setActive(permission.isActive());
        return response;
    }
}
