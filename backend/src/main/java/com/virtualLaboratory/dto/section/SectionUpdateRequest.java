package com.virtualLaboratory.dto.section;

public record SectionUpdateRequest(
    String name,
    Long teacherId
) {
}
