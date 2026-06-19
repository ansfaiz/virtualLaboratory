package com.virtualLaboratory.entities.academics;

import com.virtualLaboratory.entities.academicStructureEntities.Batch;
import com.virtualLaboratory.entities.academicStructureEntities.Section;
import com.virtualLaboratory.entities.User;
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
    private User user;
    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section;
    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

}
