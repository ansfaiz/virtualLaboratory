package com.virtualLaboratory.entities.PerformanceTracking;

import com.virtualLaboratory.entities.Academics.Teacher;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "teacher_performances")
public class TeacherPerformance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    private String remark;
    private Double rating;


}
