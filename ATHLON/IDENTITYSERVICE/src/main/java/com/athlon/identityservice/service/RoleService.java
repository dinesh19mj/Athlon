package com.athlon.identityservice.service;

import com.athlon.identityservice.dto.request.CreateRoleRequest;
import com.athlon.identityservice.dto.response.RoleResponse;
import com.athlon.identityservice.entity.Role;
import com.athlon.identityservice.exception.DuplicateResourceException;
import com.athlon.identityservice.exception.ResourceNotFoundException;
import com.athlon.identityservice.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional
    public RoleResponse createRole(CreateRoleRequest request, Long currentUserId) {
        if (roleRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Role already exists with name: " + request.getName());
        }

        Role role = new Role(request.getName(), request.getDescription(), currentUserId);
        role = roleRepository.save(role);

        return mapToResponse(role);
    }

    @Transactional
    public void deleteRole(UUID uuid, Long currentUserId) {
        Role role = roleRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with UUID: " + uuid));
        
        role.setActive(false);
        role.setUpdatedBy(currentUserId);
        roleRepository.save(role);
    }

    @Transactional(readOnly = true)
    public RoleResponse getRoleByUuid(UUID uuid) {
        Role role = roleRepository.findByUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with UUID: " + uuid));
                
        return mapToResponse(role);
    }
    
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private RoleResponse mapToResponse(Role role) {
        RoleResponse response = new RoleResponse();
        response.setUuid(role.getUuid());
        response.setName(role.getName());
        response.setDescription(role.getDescription());
        response.setActive(role.isActive());
        return response;
    }
}
