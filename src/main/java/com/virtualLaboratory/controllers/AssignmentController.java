package com.virtualLaboratory.controllers;

import com.virtualLaboratory.dto.assignment.AssignmentCreateRequest;
import com.virtualLaboratory.dto.assignment.AssignmentDTO;
import com.virtualLaboratory.dto.assignment.AssignmentUpdateRequest;
import com.virtualLaboratory.dto.assignment.AssignmentWithStatusDTO;
import com.virtualLaboratory.dto.submission.SubmissionDTO;
import com.virtualLaboratory.services.AssignmentService;
import com.virtualLaboratory.services.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {
    private final AssignmentService assignmentService;
    private final SubmissionService submissionService;

    public AssignmentController(AssignmentService assignmentService, SubmissionService submissionService) {
        this.assignmentService = assignmentService;
        this.submissionService = submissionService;
    }

    @GetMapping
    public ResponseEntity<Page<AssignmentDTO>> getAssignments(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Long sectionId,
        Pageable pageable
    ) {
        return ResponseEntity.ok(assignmentService.getTeacherAssignments(status, sectionId, pageable));
    }

    @PostMapping
    public ResponseEntity<AssignmentDTO> createAssignment(@Valid @RequestBody AssignmentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentDTO> getAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssignmentDTO> updateAssignment(@PathVariable Long id, @Valid @RequestBody AssignmentUpdateRequest request) {
        return ResponseEntity.ok(assignmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<AssignmentDTO> publishAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.publish(id));
    }

    @GetMapping("/student")
    public ResponseEntity<List<AssignmentWithStatusDTO>> getStudentAssignments() {
        return ResponseEntity.ok(assignmentService.getStudentAssignments());
    }

    @PostMapping("/{id}/sections/{sectionId}")
    public ResponseEntity<Void> assignSection(@PathVariable Long id, @PathVariable Long sectionId) {
        assignmentService.assignSection(id, sectionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/sections/{sectionId}")
    public ResponseEntity<Void> unassignSection(@PathVariable Long id, @PathVariable Long sectionId) {
        assignmentService.unassignSection(id, sectionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/submissions")
    public ResponseEntity<List<SubmissionDTO>> getAssignmentSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getAssignmentSubmissions(id));
    }
}
