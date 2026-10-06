package com.awais.hr.config;

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

    @Value("${jwt.secret:awais_hr_enterprise_secure_jwt_token_secret_key_256_bits_long}")
    private String secretString = "awais_hr_enterprise_secure_jwt_token_secret_key_256_bits_long";

    @Value("${jwt.expiration-ms:86400000}")
    private long expirationMs = 86400000;

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, String tenantId, String roles) {
        return Jwts.builder()
                .subject(email)
                .claim("tenantId", tenantId)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSecretKey())
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSecretKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public String getTenantIdFromToken(String token) {
        return getClaims(token).get("tenantId", String.class);
    }

    public String getRolesFromToken(String token) {
        return getClaims(token).get("roles", String.class);
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
