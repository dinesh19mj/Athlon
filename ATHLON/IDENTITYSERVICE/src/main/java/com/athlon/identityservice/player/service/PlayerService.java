package com.athlon.identityservice.player.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

import com.athlon.identityservice.account.model.Role;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.athlon.identityservice.Util.EmailUtil;
import com.athlon.identityservice.Util.FileStorageUtil;
import com.athlon.identityservice.Util.PasswordGeneration;
import com.athlon.identityservice.account.model.Accounts;
import com.athlon.identityservice.account.model.RoleMapping;
import com.athlon.identityservice.account.repository.AccountRepository;
import com.athlon.identityservice.account.repository.RoleMappingRepository;
import com.athlon.identityservice.account.repository.RoleRepository;
import com.athlon.identityservice.exception.ResourceAlreadyExistsException;
import com.athlon.identityservice.player.model.Players;
import com.athlon.identityservice.player.repository.PlayersRepository;

@Service
public class PlayerService {

    @Autowired
    private PlayersRepository playersRepository;

    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private RoleMappingRepository roleMappingRepository;

    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private EmailUtil emailUtil;
    
    @Autowired
    private PasswordGeneration passwordGeneration;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FileStorageUtil fileStorageUtil;

    @Value("${athlon.player.photo.upload.directory}")
    private String playerDoc;

    @Transactional
    public Players savePlayer(Players player) {
        if (player.getEmail() != null && playersRepository.findByEmail(player.getEmail()).isPresent()) {
            throw new ResourceAlreadyExistsException("Player with email " + player.getEmail() + " already exists.");
        }

        if (player.getPhoneNumber() != null && playersRepository.findByPhoneNumber(player.getPhoneNumber()).isPresent()) {
            throw new ResourceAlreadyExistsException("Player with phone number " + player.getPhoneNumber() + " already exists.");
        }

        if (player.getPlayerUuid() == null) {
            player.setPlayerUuid(UUID.randomUUID());
        }
        
        player.setCreatedOn(LocalDateTime.now());
        player.setIsActive(1);
        player.setStatus("ACTIVE");
        
        if (player.getRoleType() == null || player.getRoleType().isEmpty()) {
            player.setRoleType("Player");
        }

        String password = passwordGeneration.generatePassword();
		String encryptedPassword = passwordEncoder.encode(password);
		
        player.setPassword(encryptedPassword);

        Players savedPlayer = playersRepository.save(player);

        Accounts account = new Accounts();
        account.setAccountUuid(UUID.randomUUID());
        account.setFirstName(savedPlayer.getFirstName());
        account.setLastName(savedPlayer.getLastName());
        account.setEmail(savedPlayer.getEmail());
        account.setPhoneNumber(savedPlayer.getPhoneNumber());
        account.setPassword(savedPlayer.getPassword());
        account.setRoleType(savedPlayer.getRoleType());
        account.setCreatedOn(savedPlayer.getCreatedOn());
        account.setIsActive(savedPlayer.getIsActive());
        account.setStatus(savedPlayer.getStatus());
        account.setParentId(savedPlayer.getPlayerId());
        Accounts savedAccount = accountRepository.save(account);

        RoleMapping roleMapping = new RoleMapping();
        roleMapping.setAccountId(savedAccount.getAccountId());
        roleMapping.setAccountUuid(savedAccount.getAccountUuid());
        roleMapping.setRoleId(1L);
        roleMapping.setRoleName("Player");
        roleMapping.setStatus("ACTIVE");

        roleMappingRepository.save(roleMapping);

        emailUtil.sendPasswordEmail(savedPlayer.getEmail(), savedPlayer.getFirstName(), password);

        return savedPlayer;
    }

    @Transactional
    public Players updatePlayer(Long playerId, Players playerDetails, MultipartFile photo) throws IOException {
        Players existingPlayer = playersRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found with id: " + playerId));

        if (playerDetails.getFirstName() != null) {
            existingPlayer.setFirstName(playerDetails.getFirstName());
        }
        if (playerDetails.getLastName() != null) {
            existingPlayer.setLastName(playerDetails.getLastName());
        }
        if (playerDetails.getBio() != null) {
            existingPlayer.setBio(playerDetails.getBio());
        }
        if (playerDetails.getDob() != null) {
            existingPlayer.setDob(playerDetails.getDob());
        }

        if (photo != null && !photo.isEmpty()) {
            String photoFileName = fileStorageUtil.saveFile(photo, playerDoc, "photos");
            existingPlayer.setPhoto(photoFileName);
        }

        existingPlayer.setModifiedOn(LocalDateTime.now());
        
        Optional<Accounts> optionalAccount = accountRepository.findByParentId(existingPlayer.getPlayerId());
        if (optionalAccount.isPresent()) {
            Accounts account = optionalAccount.get();
            if (playerDetails.getFirstName() != null) account.setFirstName(playerDetails.getFirstName());
            if (playerDetails.getLastName() != null) account.setLastName(playerDetails.getLastName());
            account.setModifiedOn(LocalDateTime.now());
            accountRepository.save(account);
        }

        return playersRepository.save(existingPlayer);
    }
    public Players getPlayerById(Long playerId) {
        return playersRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));
    }

    @Transactional
    public Players updatePhoto(Long playerId, MultipartFile photo) throws IOException {
        Players existingPlayer = playersRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found with id: " + playerId));

        if (photo != null && !photo.isEmpty()) {
            String photoFileName = fileStorageUtil.saveFile(photo, playerDoc, "photos");
            existingPlayer.setPhoto(photoFileName);
            existingPlayer.setModifiedOn(LocalDateTime.now());
            return playersRepository.save(existingPlayer);
        }
        return existingPlayer;
    }

    public List<String> getRoles(Long playerId) {
        Accounts account = accountRepository.findByParentId(playerId)
                .orElseThrow(() -> new RuntimeException("Account not found for playerId: " + playerId));
        List<RoleMapping> roles = roleMappingRepository.findByAccountId(account.getAccountId());
        return roles.stream().map(RoleMapping::getRoleName).toList();
    }

    public List<String> getAllRoles() {
        return roleRepository.findAll().stream().map(Role::getRoleName).toList();
    }

    @Transactional
    public void assignRole(Long playerId, String roleName) {
        Accounts account = accountRepository.findByParentId(playerId)
                .orElseThrow(() -> new RuntimeException("Account not found for playerId: " + playerId));
        
        Optional<RoleMapping> existingRole = roleMappingRepository.findByAccountIdAndRoleName(account.getAccountId(), roleName);
        if (existingRole.isPresent()) {
            throw new ResourceAlreadyExistsException("Role " + roleName + " is already assigned to this player.");
        }
        
        RoleMapping roleMapping = new RoleMapping();
        roleMapping.setAccountId(account.getAccountId());
        roleMapping.setAccountUuid(account.getAccountUuid());
        
        Role role = roleRepository.findByRoleNameIgnoreCase(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found in the database: " + roleName));
        
        roleMapping.setRoleId(role.getRoleId());
        roleMapping.setRoleName(role.getRoleName());
        roleMapping.setStatus("ACTIVE");
        
        roleMappingRepository.save(roleMapping);
    }
}
