package com.virtualLaboratory.mapper;

import com.virtualLaboratory.dto.section.SectionDTO;
import com.virtualLaboratory.dto.user.UserDTO;
import com.virtualLaboratory.entities.academicStructureEntities.Section;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SectionMapper {
    public SectionDTO toDto(Section section, List<UserDTO> studentDtos) {
        return new SectionDTO(
            section.getId(),
            section.getName(),
            section.getBatch() != null ? section.getBatch().getId() : null,
            section.getTeacher() != null ? section.getTeacher().getId() : null,
            studentDtos.size(),
            studentDtos
        );
    }
}
