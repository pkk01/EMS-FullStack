package com.employee.main.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.main.entity.Admin;
import com.employee.main.entity.Employee;
import com.employee.main.service.AdminService;
import com.employee.main.service.EmployeeService;
import com.employee.main.util.JwtUtil;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().build();
            }

            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).build();
            }

            String email = jwtUtil.getEmailFromToken(token);
            Admin admin = adminService.getAdminByEmail(email);
            List<Employee> employees = employeeService.getEmployeesByCompany(admin.getCompanyName());
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().build();
            }

            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).build();
            }

            String email = jwtUtil.getEmailFromToken(token);
            Admin admin = adminService.getAdminByEmail(email);

            return employeeService.getEmployeeById(id)
                    .filter(employee -> employee.getCompanyName().equals(admin.getCompanyName()))
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().build();
            }

            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).build();
            }

            String email = jwtUtil.getEmailFromToken(token);
            Admin admin = adminService.getAdminByEmail(email);
            employee.setCompanyName(admin.getCompanyName());

            Employee createdEmployee = employeeService.createEmployee(employee);
            return ResponseEntity.ok(createdEmployee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee employee,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().build();
            }

            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).build();
            }

            String email = jwtUtil.getEmailFromToken(token);
            Admin admin = adminService.getAdminByEmail(email);

            return employeeService.getEmployeeById(id)
                    .filter(e -> e.getCompanyName().equals(admin.getCompanyName()))
                    .map(e -> {
                        employee.setCompanyName(admin.getCompanyName());
                        return ResponseEntity.ok(employeeService.updateEmployee(id, employee));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().build();
            }

            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(401).build();
            }

            String email = jwtUtil.getEmailFromToken(token);
            Admin admin = adminService.getAdminByEmail(email);

            return employeeService.getEmployeeById(id)
                    .filter(employee -> employee.getCompanyName().equals(admin.getCompanyName()))
                    .map(employee -> {
                        employeeService.deleteEmployee(id);
                        return ResponseEntity.ok().<Void>build();
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}