package com.virtualLaboratory.mapper;

import com.virtualLaboratory.dto.assignment.AssignmentDTO;
import com.virtualLaboratory.entities.academicStructureEntities.Section;
import com.virtualLaboratory.entities.codingLaboratoryEntities.Assignment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AssignmentMapper {
    public AssignmentDTO toDto(Assignment assignment) {
        List<Long> sectionIds = assignment.getSections() != null
            ? assignment.getSections().stream().map(Section::getId).collect(Collectors.toList())
            : List.of();
        return new AssignmentDTO(
            assignment.getId(),
            assignment.getTitle(),
            assignment.getDescription(),
            assignment.getStarterCode(),
            assignment.getLanguage() != null ? assignment.getLanguage().getId() : null,
            sectionIds,
            assignment.getDueDate(),
            assignment.getMaxScore(),
            assignment.getStatus() != null ? assignment.getStatus().name() : null,
            assignment.getTeacher() != null ? assignment.getTeacher().getId() : null
        );
    }
}
