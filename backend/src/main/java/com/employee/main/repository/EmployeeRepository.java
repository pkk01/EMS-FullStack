package com.employee.main.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.employee.main.entity.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    @Query("SELECT e FROM Employee e ORDER BY e.firstName, e.lastName")
    List<Employee> findAll();

    boolean existsByEmail(String email);
}