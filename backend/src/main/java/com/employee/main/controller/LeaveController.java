package com.employee.main.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.main.entity.Leave;
import com.employee.main.service.LeaveService;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "http://localhost:5173")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @GetMapping
    public ResponseEntity<List<Leave>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @PostMapping
    public ResponseEntity<Leave> createLeave(@RequestBody LeaveRequest leaveRequest) {
        return ResponseEntity.ok(leaveService.createLeave(leaveRequest.getEmployeeId(), leaveRequest.getLeave()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Leave> updateLeaveStatus(
            @PathVariable Long id,
            @RequestBody LeaveStatusRequest statusRequest) {
        return ResponseEntity.ok(leaveService.updateLeaveStatus(id, statusRequest.getStatus()));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Leave>> getLeavesByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getLeavesByEmployee(employeeId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Leave>> getLeavesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(leaveService.getLeavesByStatus(status));
    }
}

class LeaveStatusRequest {
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

class LeaveRequest {
    private Long employeeId;
    private Leave leave;

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Leave getLeave() {
        return leave;
    }

    public void setLeave(Leave leave) {
        this.leave = leave;
    }
}