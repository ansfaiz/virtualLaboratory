package com.virtualLaboratory.services;

import com.virtualLaboratory.dto.batch.BatchCreateRequest;
import com.virtualLaboratory.dto.batch.BatchDTO;
import com.virtualLaboratory.dto.batch.BatchUpdateRequest;
import com.virtualLaboratory.entities.academicStructureEntities.Batch;
import com.virtualLaboratory.mapper.BatchMapper;
import com.virtualLaboratory.repository.BatchRepository;
import com.virtualLaboratory.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BatchService {
    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;
    private final BatchMapper batchMapper;

    public BatchService(BatchRepository batchRepository, StudentRepository studentRepository, BatchMapper batchMapper) {
        this.batchRepository = batchRepository;
        this.studentRepository = studentRepository;
        this.batchMapper = batchMapper;
    }

    public List<BatchDTO> getAll() {
        return batchRepository.findAll().stream()
            .map(batch -> batchMapper.toDto(batch, studentRepository.findByBatchId(batch.getId()).size()))
            .collect(Collectors.toList());
    }

    public BatchDTO getById(Long id) {
        Batch batch = batchRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        return batchMapper.toDto(batch, studentRepository.findByBatchId(batch.getId()).size());
    }

    @Transactional
    public BatchDTO create(BatchCreateRequest request) {
        Batch batch = batchMapper.toEntity(request);
        Batch saved = batchRepository.save(batch);
        return batchMapper.toDto(saved, 0);
    }

    @Transactional
    public BatchDTO update(Long id, BatchUpdateRequest request) {
        Batch batch = batchRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        batchMapper.updateEntity(batch, request);
        Batch saved = batchRepository.save(batch);
        return batchMapper.toDto(saved, studentRepository.findByBatchId(saved.getId()).size());
    }

    @Transactional
    public void delete(Long id) {
        Batch batch = batchRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        if (!studentRepository.findByBatchId(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Batch has enrolled students");
        }
        batchRepository.delete(batch);
    }
}
