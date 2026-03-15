package com.virtualLaboratory.entities.codingLaboratoryEntities;

import com.virtualLaboratory.entities.academicStructureEntities.Section;
import com.virtualLaboratory.entities.academics.Teacher;
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
    private String title;
    @Lob
    private String description;
    @Lob
    private String starterCode;
    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
    @ManyToOne
    @JoinColumn(name = "language_id")
    private ProgrammingLanguage language;
    private LocalDateTime dueDate;
    private Integer maxScore = 100;
    @Enumerated(EnumType.STRING)
    private Status status = Status.DRAFT;
    @ManyToMany
    @JoinTable(
        name = "assignment_sections",
        joinColumns = @JoinColumn(name = "assignment_id"),
        inverseJoinColumns = @JoinColumn(name = "section_id")
    )
    private java.util.List<Section> sections;

    public enum Status {
        DRAFT,
        PUBLISHED
    }

}
