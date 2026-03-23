package com.virtualLaboratory.repository;

import com.virtualLaboratory.entities.academicStructureEntities.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatchRepository extends JpaRepository<Batch, Long> {
}
