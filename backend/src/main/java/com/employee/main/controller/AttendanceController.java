package com.employee.main.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import com.employee.main.entity.Attendance;
import com.employee.main.service.AttendanceService;
import com.employee.main.util.JwtUtil;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private JwtUtil jwtUtil;

    private void setAdminEmailInContext(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid authorization header");
        }

        String token = authHeader.substring(7); // Remove "Bearer " prefix
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Invalid token");
        }

        String adminEmail = jwtUtil.getEmailFromToken(token);
        RequestContextHolder.currentRequestAttributes()
                .setAttribute("adminEmail", adminEmail, RequestAttributes.SCOPE_REQUEST);
    }

    @PostMapping("/{employeeId}")
    public ResponseEntity<Attendance> markAttendance(
            @PathVariable("employeeId") Long employeeId,
            @RequestParam String status,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String authHeader) {
        try {
            setAdminEmailInContext(authHeader);
            return ResponseEntity.ok(attendanceService.markAttendance(employeeId, status, date));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{attendanceId}/checkout")
    public ResponseEntity<Attendance> markCheckout(
            @PathVariable("attendanceId") Long attendanceId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            setAdminEmailInContext(authHeader);
            return ResponseEntity.ok(attendanceService.markCheckout(attendanceId));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Attendance>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String authHeader) {
        setAdminEmailInContext(authHeader);
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Attendance>> getEmployeeAttendanceByDateRange(
            @PathVariable("employeeId") Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String authHeader) {
        try {
            setAdminEmailInContext(authHeader);
            LocalDate queryDate = date != null ? date : LocalDate.now();
            LocalDateTime startDate = queryDate.atStartOfDay();
            LocalDateTime endDate = queryDate.atTime(LocalTime.MAX);

            return ResponseEntity
                    .ok(attendanceService.getEmployeeAttendanceByDateRange(employeeId, startDate, endDate));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/date/{date}/download")
    public ResponseEntity<byte[]> downloadAttendanceExcel(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String authHeader) {
        try {
            setAdminEmailInContext(authHeader);
            byte[] excelFile = attendanceService.generateExcelReport(date);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(
                    MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "attendance_" + date + ".xlsx");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelFile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}