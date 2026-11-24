package com.virtualLaboratory.security;

import com.virtualLaboratory.entities.RevokedToken;
import com.virtualLaboratory.repository.RevokedTokenRepository;
import io.jsonwebtoken.JwtException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class TokenBlacklistService {
    private final RevokedTokenRepository revokedTokenRepository;
    private final JwtService jwtService;

    public TokenBlacklistService(RevokedTokenRepository revokedTokenRepository, JwtService jwtService) {
        this.revokedTokenRepository = revokedTokenRepository;
        this.jwtService = jwtService;
    }

    public void blacklist(String token) {
        if (token == null || token.isBlank()) {
            return;
        }

        Instant now = Instant.now();
        Instant expiresAt;
        try {
            expiresAt = jwtService.extractExpiration(token);
        } catch (JwtException | IllegalArgumentException ex) {
            return;
        }
        if (!expiresAt.isAfter(now)) {
            return;
        }

        String tokenHash = hash(token);
        if (revokedTokenRepository.existsByTokenHashAndExpiresAtAfter(tokenHash, now)) {
            return;
        }

        RevokedToken revokedToken = new RevokedToken(null, tokenHash, expiresAt, now);
        try {
            revokedTokenRepository.save(revokedToken);
        } catch (DataIntegrityViolationException ex) {
            // A concurrent logout may have inserted the same unique token hash.
        }
    }

    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return revokedTokenRepository.existsByTokenHashAndExpiresAtAfter(hash(token), Instant.now());
    }

    @Scheduled(fixedDelayString = "${app.jwt.blacklist-cleanup-ms:3600000}")
    @Transactional
    public void cleanupExpiredTokens() {
        revokedTokenRepository.deleteByExpiresAtBefore(Instant.now());
    }

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }
}
