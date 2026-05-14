package com.focusforge.security;

import com.focusforge.entity.AppUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Service
public class TokenService {

    private final String secret;
    private final long expirationSeconds;

    public TokenService(
            @Value("${focusforge.security.token-secret:focusforge-dev-secret-change-me}") String secret,
            @Value("${focusforge.security.token-expiration-seconds:604800}") long expirationSeconds) {
        this.secret = secret;
        this.expirationSeconds = expirationSeconds;
    }

    public String createToken(AppUser user) {
        long expiresAt = Instant.now().getEpochSecond() + expirationSeconds;
        String payload = user.getId() + ":" + expiresAt;
        String encodedPayload = encode(payload.getBytes(StandardCharsets.UTF_8));
        String signature = sign(encodedPayload);
        return encodedPayload + "." + signature;
    }

    public Optional<Long> verifyToken(String token) {
        if (token == null || !token.contains(".")) {
            return Optional.empty();
        }

        String[] parts = token.split("\\.", 2);
        if (parts.length != 2 || !constantTimeEquals(sign(parts[0]), parts[1])) {
            return Optional.empty();
        }

        try {
            String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            String[] values = payload.split(":", 2);
            long userId = Long.parseLong(values[0]);
            long expiresAt = Long.parseLong(values[1]);
            if (expiresAt < Instant.now().getEpochSecond()) {
                return Optional.empty();
            }
            return Optional.of(userId);
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return encode(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign auth token", ex);
        }
    }

    private String encode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private boolean constantTimeEquals(String first, String second) {
        return java.security.MessageDigest.isEqual(
                first.getBytes(StandardCharsets.UTF_8),
                second.getBytes(StandardCharsets.UTF_8));
    }
}
