package com.employee.main.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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
        logger.info("Attempting to mark attendance for employee {} with status {} on date {}", employeeId, status,
                date);

        // Validate employee exists
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> {
                    logger.error("Employee not found with ID: {}", employeeId);
                    return new RuntimeException("Employee not found");
                });

        // Set time range for the day
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        // Check for existing attendance record
        List<Attendance> existingAttendance = attendanceRepository
                .findByEmployeeAndCheckInBetween(employee, startOfDay, endOfDay);

        if (!existingAttendance.isEmpty()) {
            logger.warn("Found existing attendance record for employee {} on date {}. Cannot mark attendance again.",
                    employeeId, date);
            throw new RuntimeException("Attendance already marked for this employee on this date");
        }

        // Validate status
        if (!isValidStatus(status)) {
            logger.error("Invalid status provided: {}", status);
            throw new RuntimeException("Invalid attendance status");
        }

        // Create new attendance record
        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setStatus(status);
        LocalDateTime now = LocalDateTime.now();
        attendance.setCheckIn(now);

        logger.info("Creating new attendance record for employee {} with status {} at {}",
                employeeId, status, now);

        Attendance savedAttendance = attendanceRepository.save(attendance);

        // Ensure employee data is loaded
        savedAttendance.setEmployee(employee);

        logger.info("Saved attendance record: {}", savedAttendance);
        return savedAttendance;
    }

    private boolean isValidStatus(String status) {
        return status != null && (status.equals("PRESENT") || status.equals("ABSENT"));
    }

    public Attendance markCheckout(Long attendanceId) {
        logger.info("Attempting to mark checkout for attendance record {}", attendanceId);

        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> {
                    logger.error("Attendance record not found with ID: {}", attendanceId);
                    return new RuntimeException("Attendance record not found");
                });

        if (attendance.getCheckOut() != null) {
            logger.warn("Attendance record {} already has checkout time: {}",
                    attendanceId, attendance.getCheckOut());
            throw new RuntimeException("Checkout already marked for this attendance record");
        }

        LocalDateTime now = LocalDateTime.now();
        attendance.setCheckOut(now);

        logger.info("Marked checkout for attendance record {} at {}", attendanceId, now);
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
                    // Ensure status is set
                    if (attendance.getStatus() == null) {
                        attendance.setStatus("NOT_MARKED");
                    }
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
                newAttendance.setCheckIn(null);
                newAttendance.setCheckOut(null);
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

    public byte[] generateExcelReport(LocalDate date) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Attendance Report");

            // Create header row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Employee Name");
            headerRow.createCell(1).setCellValue("Status");
            headerRow.createCell(2).setCellValue("Check In");
            headerRow.createCell(3).setCellValue("Check Out");

            // Get attendance data
            List<Attendance> attendanceList = getAttendanceByDate(date);
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");

            // Fill data rows
            int rowNum = 1;
            for (Attendance attendance : attendanceList) {
                Row row = sheet.createRow(rowNum++);

                // Employee Name
                String employeeName = attendance.getEmployee().getFirstName() + " " +
                        attendance.getEmployee().getLastName();
                row.createCell(0).setCellValue(employeeName);

                // Status - Handle all possible cases
                String status = attendance.getStatus();
                if (status == null || status.isEmpty() || "NOT_MARKED".equals(status)) {
                    status = "Not Marked";
                } else if ("PRESENT".equals(status)) {
                    status = "Present";
                } else if ("ABSENT".equals(status)) {
                    status = "Absent";
                }
                row.createCell(1).setCellValue(status);

                // Check In
                String checkIn = attendance.getCheckIn() != null ? attendance.getCheckIn().format(timeFormatter) : "-";
                row.createCell(2).setCellValue(checkIn);

                // Check Out
                String checkOut = attendance.getCheckOut() != null ? attendance.getCheckOut().format(timeFormatter)
                        : "-";
                row.createCell(3).setCellValue(checkOut);
            }

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            logger.error("Error generating Excel report", e);
            throw new RuntimeException("Failed to generate Excel report");
        }
    }
}