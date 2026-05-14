package com.focusforge.security;

import com.focusforge.entity.AppUser;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TokenServiceTest {

    @Test
    void createdTokenVerifiesUserId() {
        TokenService tokenService = new TokenService("test-secret", 3600);
        AppUser user = new AppUser("Demo", "demo@focusforge.dev", "hash");
        user.setId(42L);

        String token = tokenService.createToken(user);

        assertEquals(42L, tokenService.verifyToken(token).orElseThrow());
    }

    @Test
    void tamperedTokenIsRejected() {
        TokenService tokenService = new TokenService("test-secret", 3600);

        assertTrue(tokenService.verifyToken("tampered.token").isEmpty());
    }
}
