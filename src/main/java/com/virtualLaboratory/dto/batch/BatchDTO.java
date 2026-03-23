package com.virtualLaboratory.dto.batch;

import java.time.LocalDate;
import java.util.List;

public record BatchDTO(
    Long id,
    String name,
    Integer year,
    LocalDate startDate,
    Integer sectionCount,
    Integer studentCount,
    List<Long> sectionIds
) {
}
