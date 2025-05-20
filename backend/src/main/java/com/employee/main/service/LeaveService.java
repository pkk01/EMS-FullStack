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

    @Autowired
    private EmailService emailService;

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

    public Leave updateLeaveStatus(Long leaveId, String status, String adminName) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!isValidStatus(status)) {
            throw new RuntimeException("Invalid status");
        }

        leave.setStatus(status);
        Leave updatedLeave = leaveRepository.save(leave);

        // Send email notifications
        try {
            Employee employee = leave.getEmployee();
            String startDate = leave.getStartDate().toString();
            String endDate = leave.getEndDate().toString();

            if (status.equals("APPROVED")) {
                emailService.sendLeaveApprovalEmail(
                        employee.getEmail(),
                        employee.getFirstName() + " " + employee.getLastName(),
                        adminName,
                        startDate,
                        endDate);
            } else if (status.equals("REJECTED")) {
                emailService.sendLeaveRejectionEmail(
                        employee.getEmail(),
                        employee.getFirstName() + " " + employee.getLastName(),
                        adminName,
                        startDate,
                        endDate);
            }

            // Send notification to admin
            emailService.sendAdminNotificationEmail(
                    "prathamdowork@gmail.com", // Admin email
                    adminName,
                    employee.getFirstName() + " " + employee.getLastName(),
                    startDate,
                    endDate,
                    status.equals("APPROVED"));
        } catch (Exception e) {
            // Log the error but don't throw it to prevent the leave status update from
            // failing
            e.printStackTrace();
        }

        return updatedLeave;
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