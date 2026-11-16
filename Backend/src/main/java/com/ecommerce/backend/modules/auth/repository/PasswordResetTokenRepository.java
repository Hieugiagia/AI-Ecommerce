package com.ecommerce.backend.modules.auth.repository;

import com.ecommerce.backend.modules.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    @Query("""
            select t.userId
            from PasswordResetToken t
            where t.tokenHash = :tokenHash
            """)
    Optional<Long> findUserIdByTokenHash(@Param("tokenHash") String tokenHash);
}