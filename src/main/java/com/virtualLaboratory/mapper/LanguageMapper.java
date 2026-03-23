package com.virtualLaboratory.mapper;

import com.virtualLaboratory.dto.language.LanguageCreateRequest;
import com.virtualLaboratory.dto.language.LanguageDTO;
import com.virtualLaboratory.dto.language.LanguageUpdateRequest;
import com.virtualLaboratory.entities.codingLaboratoryEntities.ProgrammingLanguage;
import org.springframework.stereotype.Component;

@Component
public class LanguageMapper {
    public ProgrammingLanguage toEntity(LanguageCreateRequest request) {
        ProgrammingLanguage language = new ProgrammingLanguage();
        language.setName(request.name());
        language.setVersion(request.version());
        language.setExtension(request.extension());
        language.setActive(request.active());
        language.setIcon(request.icon());
        return language;
    }

    public void updateEntity(ProgrammingLanguage language, LanguageUpdateRequest request) {
        if (request.version() != null) {
            language.setVersion(request.version());
        }
        if (request.active() != null) {
            language.setActive(request.active());
        }
        if (request.icon() != null) {
            language.setIcon(request.icon());
        }
    }

    public LanguageDTO toDto(ProgrammingLanguage language) {
        return new LanguageDTO(
            language.getId(),
            language.getName(),
            language.getVersion(),
            language.getExtension(),
            language.getIcon(),
            language.isActive()
        );
    }
}
