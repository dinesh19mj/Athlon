package com.athlon.gateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/actuator")
public class InfoController {

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "Athlon Gateway Service");
        info.put("version", "1.0.0");
        info.put("timestamp", LocalDateTime.now());
        info.put("description", "API Gateway for ATHLON Sports Tournament Management Platform");
        
        return ResponseEntity.ok(info);
    }
}
