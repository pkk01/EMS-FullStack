package com.employee.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.employee.main.entity.Admin;
import com.employee.main.repository.AdminRepository;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    public Admin registerAdmin(Admin request) {
        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Admin admin = new Admin();
        admin.setFullName(request.getFullName());
        admin.setCompanyName(request.getCompanyName());
        admin.setEmail(request.getEmail());
        admin.setPassword(request.getPassword());

        return adminRepository.save(admin);
    }

    // Update the login method to return boolean
    public boolean loginAdmin(String email, String password) {
        try {
            Admin admin = adminRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return admin.getPassword().equals(password);
        } catch (Exception e) {
            return false;
        }
    }
}