package com.employee.main.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.employee.main.entity.Employee;
import com.employee.main.entity.Leave;
import com.employee.main.repository.EmployeeRepository;
import com.employee.main.repository.LeaveRepository;

@Service
@Transactional
public class LeaveService {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }

    public Leave createLeave(Long employeeId, Leave leave) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        leave.setEmployee(employee);
        leave.setStatus("PENDING");
        return leaveRepository.save(leave);
    }

    public Leave updateLeaveStatus(Long leaveId, String status) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!isValidStatus(status)) {
            throw new RuntimeException("Invalid status");
        }

        leave.setStatus(status);
        return leaveRepository.save(leave);
    }

    public List<Leave> getLeavesByEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return leaveRepository.findByEmployee(employee);
    }

    public List<Leave> getLeavesByStatus(String status) {
        if (!isValidStatus(status)) {
            throw new RuntimeException("Invalid status");
        }
        return leaveRepository.findByStatus(status);
    }

    private boolean isValidStatus(String status) {
        return status != null &&
                (status.equals("PENDING") ||
                        status.equals("APPROVED") ||
                        status.equals("REJECTED"));
    }
}