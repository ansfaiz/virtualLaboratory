package com.virtualLaboratory.controllers;

import com.virtualLaboratory.dto.section.SectionCreateRequest;
import com.virtualLaboratory.dto.section.SectionDTO;
import com.virtualLaboratory.dto.section.SectionUpdateRequest;
import com.virtualLaboratory.dto.user.UserDTO;
import com.virtualLaboratory.services.SectionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
public class SectionController {
    private final SectionService sectionService;

    public SectionController(SectionService sectionService) {
        this.sectionService = sectionService;
    }

    @GetMapping
    public ResponseEntity<Page<SectionDTO>> getAllSections(
        @RequestParam(required = false) Long batchId,
        @RequestParam(required = false) Long teacherId,
        Pageable pageable
    ) {
        return ResponseEntity.ok(sectionService.getAll(batchId, teacherId, pageable));
    }

    @PostMapping
    public ResponseEntity<SectionDTO> createSection(@Valid @RequestBody SectionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sectionService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SectionDTO> getSection(@PathVariable Long id) {
        return ResponseEntity.ok(sectionService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SectionDTO> updateSection(@PathVariable Long id, @Valid @RequestBody SectionUpdateRequest request) {
        return ResponseEntity.ok(sectionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        sectionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<List<UserDTO>> getSectionStudents(@PathVariable Long id) {
        return ResponseEntity.ok(sectionService.getStudents(id));
    }

    @PostMapping("/{id}/students/{studentId}")
    public ResponseEntity<Void> enrollStudent(@PathVariable Long id, @PathVariable Long studentId) {
        sectionService.enrollStudent(id, studentId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/students/{studentId}")
    public ResponseEntity<Void> unenrollStudent(@PathVariable Long id, @PathVariable Long studentId) {
        sectionService.unenrollStudent(id, studentId);
        return ResponseEntity.noContent().build();
    }
}
