package com.athlon.identityservice.player.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.athlon.identityservice.Util.DocumentUtil;
import com.athlon.identityservice.exception.ResourceAlreadyExistsException;
import com.athlon.identityservice.player.model.Players;
import com.athlon.identityservice.player.service.PlayerService;

@RestController
@RequestMapping("/player")
public class PlayerController {

    @Autowired
    private PlayerService playerService;
    
    @Value("${athlon.player.photo.upload.directory}")
    private String playerDoc;

    @Autowired
    private DocumentUtil documentUtil;

    @PostMapping("/register")
    public ResponseEntity<Players> registerPlayer(@RequestBody Players player) {
        try {
            Players savedPlayer = playerService.savePlayer(player);
            return new ResponseEntity<>(savedPlayer, HttpStatus.CREATED);
        } catch (ResourceAlreadyExistsException e) {
            return new ResponseEntity<>(null, HttpStatus.CONFLICT);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/updatePlayer/{playerId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Players> updatePlayer(
            @PathVariable("playerId") Long playerId,
            @RequestPart("player") Players playerDetails,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            Players updatedPlayer = playerService.updatePlayer(playerId, playerDetails, photo);
            return new ResponseEntity<>(updatedPlayer, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/updatePhoto/{playerId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Players> updatePhoto(
            @PathVariable("playerId") Long playerId,
            @RequestPart("photo") MultipartFile photo) {
        try {
            Players updatedPlayer = playerService.updatePhoto(playerId, photo);
            return new ResponseEntity<>(updatedPlayer, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getPlayerById/{playerId}")
    public ResponseEntity<Players> getPlayerById(@PathVariable("playerId") Long playerId) {
        try {
            Players player = playerService.getPlayerById(playerId);
            return new ResponseEntity<>(player, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/photo/{fileName}")
    public ResponseEntity<byte[]> getPhoto(@PathVariable("fileName") String fileName) {
        String fullPath = java.nio.file.Paths.get(playerDoc, "photos", fileName).toString();
        return documentUtil.getFile(fullPath);
    }
    
    @GetMapping("/roles/all")
    public ResponseEntity<java.util.List<String>> getAllRoles() {
        try {
            return ResponseEntity.ok(playerService.getAllRoles());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/roles/{playerId}")
    public ResponseEntity<java.util.List<String>> getRoles(@PathVariable("playerId") Long playerId) {
        try {
            return ResponseEntity.ok(playerService.getRoles(playerId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/assignRole/{playerId}")
    public ResponseEntity<String> assignRole(
            @PathVariable("playerId") Long playerId,
            @org.springframework.web.bind.annotation.RequestParam("roleName") String roleName) {
        try {
            playerService.assignRole(playerId, roleName);
            return ResponseEntity.ok("Role assigned successfully");
        } catch (ResourceAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
