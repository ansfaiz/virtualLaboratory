package com.virtualLaboratory.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fullName;
    private String password;
    private String email;
    @Enumerated(EnumType.STRING)
    private Role role;
    private boolean isActive;
    public enum Role{
        ADMIN,
        STUDENT,
        TEACHER,
        Deen,
        Coordinator
    }

}
