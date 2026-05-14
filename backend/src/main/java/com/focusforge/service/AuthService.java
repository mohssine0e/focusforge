package com.focusforge.service;

import com.focusforge.dto.AuthRequest;
import com.focusforge.dto.AuthResponse;
import com.focusforge.dto.RegisterRequest;
import com.focusforge.dto.UserResponse;
import com.focusforge.entity.AppUser;
import com.focusforge.repository.AppUserRepository;
import com.focusforge.security.CurrentUserService;
import com.focusforge.security.TokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final CurrentUserService currentUserService;

    public AuthService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder,
                       TokenService tokenService, CurrentUserService currentUserService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        AppUser user = appUserRepository.save(new AppUser(
                request.getName().trim(),
                email,
                passwordEncoder.encode(request.getPassword())));
        return new AuthResponse(tokenService.createToken(user), UserResponse.from(user));
    }

    public AuthResponse login(AuthRequest request) {
        String email = normalizeEmail(request.getEmail());
        AppUser user = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return new AuthResponse(tokenService.createToken(user), UserResponse.from(user));
    }

    public UserResponse me() {
        return UserResponse.from(currentUserService.getCurrentUser());
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
