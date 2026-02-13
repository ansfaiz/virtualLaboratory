package com.virtualLaboratory.entities.AcademicStructureEntities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String sectionName;
    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;
}
