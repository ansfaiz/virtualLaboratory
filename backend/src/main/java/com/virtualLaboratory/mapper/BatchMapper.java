package com.virtualLaboratory.mapper;

import com.virtualLaboratory.dto.batch.BatchCreateRequest;
import com.virtualLaboratory.dto.batch.BatchDTO;
import com.virtualLaboratory.dto.batch.BatchUpdateRequest;
import com.virtualLaboratory.entities.academicStructureEntities.Batch;
import com.virtualLaboratory.entities.academicStructureEntities.Section;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class BatchMapper {
    public Batch toEntity(BatchCreateRequest request) {
        Batch batch = new Batch();
        batch.setName(request.name());
        batch.setYear(request.year());
        batch.setStartDate(request.startDate());
        return batch;
    }

    public void updateEntity(Batch batch, BatchUpdateRequest request) {
        if (request.name() != null) {
            batch.setName(request.name());
        }
        if (request.year() != null) {
            batch.setYear(request.year());
        }
    }

    public BatchDTO toDto(Batch batch, int studentCount) {
        List<Section> sections = batch.getSections() != null ? batch.getSections() : Collections.emptyList();
        return new BatchDTO(
            batch.getId(),
            batch.getName(),
            batch.getYear(),
            batch.getStartDate(),
            sections.size(),
            studentCount,
            sections.stream().map(Section::getId).collect(Collectors.toList())
        );
    }
}
