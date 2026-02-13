package com.virtualLaboratory.entities.CodingLaboratoryEntities;

import com.virtualLaboratory.entities.Academics.Student;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;
    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;
    @Lob
    private String code;
    private LocalDateTime submitAt;
    private Integer marks;
    private String feedback;
}
