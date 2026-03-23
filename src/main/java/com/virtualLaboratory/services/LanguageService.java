package com.virtualLaboratory.services;

import com.virtualLaboratory.dto.language.LanguageCreateRequest;
import com.virtualLaboratory.dto.language.LanguageDTO;
import com.virtualLaboratory.dto.language.LanguageUpdateRequest;
import com.virtualLaboratory.entities.codingLaboratoryEntities.ProgrammingLanguage;
import com.virtualLaboratory.mapper.LanguageMapper;
import com.virtualLaboratory.repository.AssignmentRepository;
import com.virtualLaboratory.repository.ProgrammingLanguageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LanguageService {
    private final ProgrammingLanguageRepository languageRepository;
    private final AssignmentRepository assignmentRepository;
    private final LanguageMapper languageMapper;

    public LanguageService(ProgrammingLanguageRepository languageRepository,
                           AssignmentRepository assignmentRepository,
                           LanguageMapper languageMapper) {
        this.languageRepository = languageRepository;
        this.assignmentRepository = assignmentRepository;
        this.languageMapper = languageMapper;
    }

    public List<LanguageDTO> getAll() {
        return languageRepository.findAll().stream().map(languageMapper::toDto).collect(Collectors.toList());
    }

    public LanguageDTO getById(Long id) {
        return languageMapper.toDto(languageRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Language not found")));
    }

    @Transactional
    public LanguageDTO create(LanguageCreateRequest request) {
        ProgrammingLanguage language = languageMapper.toEntity(request);
        return languageMapper.toDto(languageRepository.save(language));
    }

    @Transactional
    public LanguageDTO update(Long id, LanguageUpdateRequest request) {
        ProgrammingLanguage language = languageRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Language not found"));
        languageMapper.updateEntity(language, request);
        return languageMapper.toDto(languageRepository.save(language));
    }

    @Transactional
    public void delete(Long id) {
        if (!assignmentRepository.findByLanguageId(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Language is referenced by assignments");
        }
        languageRepository.deleteById(id);
    }
}
