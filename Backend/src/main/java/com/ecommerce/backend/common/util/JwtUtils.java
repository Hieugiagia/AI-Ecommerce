package com.ecommerce.backend.common.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expirationMs}")
    private long accessExpiration;

    @Value("${jwt.refreshExpirationMs}")
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                secretKey.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateAccessToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("type", "access")
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .subject(email)
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis() + refreshExpiration)
                )
                .signWith(getSigningKey())
                .compact();
    }

    public String getEmailFromToken(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean validateAccessToken(String token) {
        return validateTokenType(token, "access");
    }

    public boolean validateRefreshToken(String token) {
        return validateTokenType(token, "refresh");
    }

    private boolean validateTokenType(String token, String expectedType) {
        try {
            Claims claims = extractAllClaims(token);

            return expectedType.equals(claims.get("type", String.class))
                    && claims.getSubject() != null
                    && !claims.getSubject().isBlank();
        } catch (Exception exception) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}