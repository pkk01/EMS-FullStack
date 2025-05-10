package com.employee.main.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.main.entity.Admin;
import com.employee.main.service.AdminService;
import com.employee.main.util.JwtUtil;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "http://localhost:5173")
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

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentAdmin(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Invalid authorization header");
            }

            String token = authHeader.substring(7); // Remove "Bearer " prefix
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).body("Invalid token");
            }

            String email = jwtUtil.getEmailFromToken(token);
            System.out.println("Extracted email from token: " + email);

            Admin admin = adminService.getAdminByEmail(email);
            System.out.println("Found admin: " + admin.getFullName());

            // Remove password from response
            admin.setPassword(null);
            return ResponseEntity.ok(admin);
        } catch (RuntimeException e) {
            System.out.println("Error getting admin: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}