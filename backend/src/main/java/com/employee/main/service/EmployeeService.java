package com.employee.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.employee.main.entity.Employee;
import com.employee.main.repository.EmployeeRepository;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public Employee registerEmployee(Employee request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Employee employee = new Employee();
        employee.setFullName(request.getFullName());
        employee.setCompanyName(request.getCompanyName());
        employee.setEmail(request.getEmail());
        employee.setPassword(request.getPassword());

        return employeeRepository.save(employee);
    }

    // Update the login method to return boolean
    public boolean loginEmployee(String email, String password) {
        try {
            Employee employee = employeeRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return employee.getPassword().equals(password);
        } catch (Exception e) {
            return false;
        }
    }
}