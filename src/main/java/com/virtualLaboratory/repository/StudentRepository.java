package com.virtualLaboratory.repository;

import com.virtualLaboratory.entities.academics.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findBySectionId(Long sectionId);
    List<Student> findByBatchId(Long batchId);
    Optional<Student> findByUserEmail(String email);
}
