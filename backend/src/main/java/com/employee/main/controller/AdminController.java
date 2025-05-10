package com.employee.main.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.main.entity.Admin;
import com.employee.main.service.AdminService;
import com.employee.main.util.JwtUtil;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@RequestBody Admin request) {
        try {
            Admin admin = adminService.registerAdmin(request);
            return ResponseEntity.ok(admin);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Admin request) {
        try {
            boolean isValid = adminService.loginAdmin(request.getEmail(), request.getPassword());
            if (isValid) {
                // Generate JWT token
                String token = jwtUtil.generateToken(request.getEmail());

                // Create response with token
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("message", "Login successful");

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body("Invalid credentials");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body("Login failed");
        }
    }
}