package com.virtualLaboratory.entities.CodingLaboratoryEntities;

import com.virtualLaboratory.entities.AcademicStructureEntities.Section;
import com.virtualLaboratory.entities.Academics.Teacher;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String tittle;
    private String description;
    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section;
    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
    @ManyToOne
    @JoinColumn(name = "language_id")
    private ProgrammingLanguage language;
    private LocalDateTime dueDate;

}
