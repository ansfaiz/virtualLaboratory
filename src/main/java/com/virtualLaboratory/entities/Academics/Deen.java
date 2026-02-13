package com.virtualLaboratory.entities.Academics;

import com.virtualLaboratory.entities.Users;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Deen {
    @Id
    private Long id;
    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Users users;
}
