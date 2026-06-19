package com.virtualLaboratory.repository;

import com.virtualLaboratory.entities.codingLaboratoryEntities.ProgrammingLanguage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgrammingLanguageRepository extends JpaRepository<ProgrammingLanguage, Long> {
}
