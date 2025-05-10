package com.employee.main.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.employee.main.entity.Attendance;
import com.employee.main.entity.Employee;
import com.employee.main.repository.AttendanceRepository;
import com.employee.main.repository.EmployeeRepository;

@Service
@Transactional
public class AttendanceService {
    private static final Logger logger = LoggerFactory.getLogger(AttendanceService.class);

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public Attendance markAttendance(Long employeeId, String status, LocalDate date) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        Attendance existingAttendance = attendanceRepository
                .findByEmployeeAndCheckInBetween(employee, startOfDay, endOfDay)
                .stream()
                .findFirst()
                .orElse(null);

        if (existingAttendance != null) {
            existingAttendance.setStatus(status);
            return attendanceRepository.save(existingAttendance);
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setCheckIn(LocalDateTime.now());
        attendance.setStatus(status);
        return attendanceRepository.save(attendance);
    }

    public Attendance markCheckout(Long attendanceId) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        attendance.setCheckOut(LocalDateTime.now());
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        logger.info("Fetching attendance for date: {}", date);

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        // Get all employees
        List<Employee> allEmployees = employeeRepository.findAll();
        logger.info("Found {} employees", allEmployees.size());

        // Get existing attendance records
        List<Attendance> existingAttendance = attendanceRepository
                .findByCheckInBetween(startOfDay, endOfDay);
        logger.info("Found {} existing attendance records", existingAttendance.size());

        // Create a map of employee IDs to their attendance records
        List<Attendance> result = new ArrayList<>();

        // First add all existing attendance records
        for (Attendance attendance : existingAttendance) {
            if (attendance.getEmployee() != null) {
                // Ensure employee data is fresh
                Employee employee = employeeRepository.findById(attendance.getEmployee().getId())
                        .orElse(null);
                if (employee != null) {
                    attendance.setEmployee(employee);
                    result.add(attendance);
                }
            }
        }

        // Then add attendance records for employees without attendance
        for (Employee employee : allEmployees) {
            boolean hasAttendance = result.stream()
                    .anyMatch(a -> a.getEmployee() != null &&
                            a.getEmployee().getId().equals(employee.getId()));

            if (!hasAttendance) {
                Attendance newAttendance = new Attendance();
                newAttendance.setEmployee(employee);
                newAttendance.setStatus("NOT_MARKED");
                result.add(newAttendance);
            }
        }

        return result;
    }

    public List<Attendance> getEmployeeAttendanceByDateRange(Long employeeId, LocalDateTime startDate,
            LocalDateTime endDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        List<Attendance> attendances = attendanceRepository.findByEmployeeAndCheckInBetween(employee, startDate,
                endDate);

        // Update employee data in each attendance record
        for (Attendance attendance : attendances) {
            attendance.setEmployee(employee);
        }

        return attendances;
    }
}