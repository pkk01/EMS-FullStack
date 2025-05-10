package com.employee.main.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.employee.main.entity.Attendance;
import com.employee.main.entity.Employee;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployeeId(Long employeeId);

    List<Attendance> findByEmployeeIdAndCheckInBetween(Long employeeId, LocalDateTime startDate, LocalDateTime endDate);

    List<Attendance> findByCheckInBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<Attendance> findByEmployeeAndCheckInBetween(Employee employee, LocalDateTime startDate, LocalDateTime endDate);
}