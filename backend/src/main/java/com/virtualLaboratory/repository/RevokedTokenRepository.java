package com.virtualLaboratory.repository;

import com.virtualLaboratory.entities.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {

    boolean existsByTokenHashAndExpiresAtAfter(String tokenHash, Instant now);

    void deleteByExpiresAtBefore(Instant now);
}

