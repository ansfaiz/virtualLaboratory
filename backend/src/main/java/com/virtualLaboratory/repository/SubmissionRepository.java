package com.virtualLaboratory.repository;

import com.virtualLaboratory.entities.codingLaboratoryEntities.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignmentId(Long assignmentId);
    List<Submission> findByStudentId(Long studentId);
    List<Submission> findByAssignmentTeacherId(Long teacherId);
    List<Submission> findByAssignmentIdAndStatus(Long assignmentId, Submission.Status status);
    Submission findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    boolean existsByAssignmentIdAndStatusAndMarksGreaterThan(
        Long assignmentId,
        Submission.Status status,
        Integer marks
    );
}
