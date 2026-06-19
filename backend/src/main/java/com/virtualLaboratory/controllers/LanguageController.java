package com.virtualLaboratory.controllers;

import com.virtualLaboratory.dto.language.LanguageCreateRequest;
import com.virtualLaboratory.dto.language.LanguageDTO;
import com.virtualLaboratory.dto.language.LanguageUpdateRequest;
import com.virtualLaboratory.services.LanguageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/languages")
public class LanguageController {
    private final LanguageService languageService;

    public LanguageController(LanguageService languageService) {
        this.languageService = languageService;
    }

    @GetMapping
    public ResponseEntity<List<LanguageDTO>> getAllLanguages() {
        return ResponseEntity.ok(languageService.getAll());
    }

    @PostMapping
    public ResponseEntity<LanguageDTO> createLanguage(@Valid @RequestBody LanguageCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(languageService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LanguageDTO> getLanguage(@PathVariable Long id) {
        return ResponseEntity.ok(languageService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LanguageDTO> updateLanguage(@PathVariable Long id, @Valid @RequestBody LanguageUpdateRequest request) {
        return ResponseEntity.ok(languageService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLanguage(@PathVariable Long id) {
        languageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
