package com.capitalcircle.service;

import com.capitalcircle.domain.AppUser;
import com.capitalcircle.dto.AuthDtos.AuthResponse;
import com.capitalcircle.dto.AuthDtos.LoginRequest;
import com.capitalcircle.dto.AuthDtos.RegisterRequest;
import com.capitalcircle.dto.AuthDtos.UserResponse;
import com.capitalcircle.exception.BusinessException;
import com.capitalcircle.repository.AppUserRepository;
import com.capitalcircle.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException(HttpStatus.CONFLICT, "Email is already registered");
        }

        AppUser user = new AppUser();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        AppUser saved = appUserRepository.save(user);

        UserDetails principal = org.springframework.security.core.userdetails.User
            .withUsername(saved.getEmail())
            .password(saved.getPasswordHash())
            .authorities("USER")
            .build();
        return new AuthResponse(jwtService.generateToken(principal), toUserResponse(saved));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
        );
        UserDetails principal = (UserDetails) authentication.getPrincipal();
        AppUser user = getUserByEmail(principal.getUsername());
        return new AuthResponse(jwtService.generateToken(principal), toUserResponse(user));
    }

    public UserResponse me() {
        return toUserResponse(currentUser());
    }

    public AppUser currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return getUserByEmail(email);
    }

    private AppUser getUserByEmail(String email) {
        return appUserRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Authenticated user was not found"));
    }

    private UserResponse toUserResponse(AppUser user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getCreatedAt());
    }
}
