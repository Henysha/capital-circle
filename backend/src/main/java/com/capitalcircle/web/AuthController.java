package com.capitalcircle.web;

import com.capitalcircle.dto.AuthDtos.AuthResponse;
import com.capitalcircle.dto.AuthDtos.LoginRequest;
import com.capitalcircle.dto.AuthDtos.RegisterRequest;
import com.capitalcircle.dto.AuthDtos.UserResponse;
import com.capitalcircle.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    UserResponse me() {
        return authService.me();
    }
}
