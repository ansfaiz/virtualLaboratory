package com.virtualLaboratory.entities.Academics;

import com.virtualLaboratory.entities.AcademicStructureEntities.Section;
import com.virtualLaboratory.entities.Users;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {
    @Id
    private Long id;
    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Users user;
    @ManyToMany
    @JoinTable(
        name = "teacher_sections",
        joinColumns = @JoinColumn(name = "teacher_id"),
        inverseJoinColumns = @JoinColumn(name = "section_id")
    )
    private List<Section> section;

}
