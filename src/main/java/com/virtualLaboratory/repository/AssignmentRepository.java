package com.virtualLaboratory.repository;

import com.virtualLaboratory.entities.codingLaboratoryEntities.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByTeacherId(Long teacherId);
    List<Assignment> findByTeacherIdAndStatus(Long teacherId, Assignment.Status status);
    List<Assignment> findBySectionsId(Long sectionId);
    List<Assignment> findByLanguageId(Long languageId);

}
