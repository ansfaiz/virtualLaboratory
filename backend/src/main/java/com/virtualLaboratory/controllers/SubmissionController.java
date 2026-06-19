package com.virtualLaboratory.controllers;

import com.virtualLaboratory.dto.submission.SubmissionCreateRequest;
import com.virtualLaboratory.dto.submission.SubmissionDTO;
import com.virtualLaboratory.dto.submission.SubmissionGradeRequest;
import com.virtualLaboratory.dto.submission.SubmissionRunRequest;
import com.virtualLaboratory.dto.submission.SubmissionRunResponse;
import com.virtualLaboratory.services.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {
    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @GetMapping
    public ResponseEntity<Page<SubmissionDTO>> getSubmissions(
        @RequestParam(required = false) Long assignmentId,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Long sectionId,
        Pageable pageable
    ) {
        return ResponseEntity.ok(submissionService.getSubmissions(assignmentId, status, sectionId, pageable));
    }

    @PostMapping
    public ResponseEntity<SubmissionDTO> createSubmission(@Valid @RequestBody SubmissionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(submissionService.createSubmission(request));
    }

    @PostMapping("/run")
    public ResponseEntity<SubmissionRunResponse> runSubmission(@Valid @RequestBody SubmissionRunRequest request) {
        return ResponseEntity.ok(submissionService.run(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionDTO> getSubmission(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getSubmission(id));
    }

    @PutMapping("/{id}/grade")
    public ResponseEntity<SubmissionDTO> gradeSubmission(@PathVariable Long id, @Valid @RequestBody SubmissionGradeRequest request) {
        return ResponseEntity.ok(submissionService.grade(id, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<SubmissionDTO>> getMySubmissions() {
        return ResponseEntity.ok(submissionService.getMySubmissions());
    }
}
