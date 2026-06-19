package com.virtualLaboratory.dto.section;

import com.virtualLaboratory.dto.user.UserDTO;
import java.util.List;

public record SectionDTO(
    Long id,
    String name,
    Long batchId,
    Long teacherId,
    Integer studentCount,
    List<UserDTO> students
) {
}
