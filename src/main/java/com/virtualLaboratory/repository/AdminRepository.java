package com.virtualLaboratory.repository;

import com.virtualLaboratory.entities.academics.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, Long> {
}
