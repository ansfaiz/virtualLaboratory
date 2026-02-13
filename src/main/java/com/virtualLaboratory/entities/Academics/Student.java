package com.virtualLaboratory.entities.Academics;

import com.virtualLaboratory.entities.AcademicStructureEntities.Batch;
import com.virtualLaboratory.entities.AcademicStructureEntities.Section;
import com.virtualLaboratory.entities.Users;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student
{
    @Id
    private Long id;
    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Users user;
    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section;
    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

}
