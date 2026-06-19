package com.virtualLaboratory.services;

import com.virtualLaboratory.dto.auth.LoginRequest;
import com.virtualLaboratory.dto.auth.LoginResponse;
import com.virtualLaboratory.dto.user.UserDTO;
import com.virtualLaboratory.entities.User;
import com.virtualLaboratory.mapper.UserMapper;
import com.virtualLaboratory.repository.UserRepository;
import com.virtualLaboratory.security.JwtService;
import com.virtualLaboratory.security.TokenBlacklistService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserMapper userMapper;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       UserRepository userRepository,
                       UserService userService,
                       TokenBlacklistService tokenBlacklistService,
                       UserMapper userMapper) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.userService = userService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.userMapper = userMapper;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);
        User user = userRepository.findByEmail(request.email());
        UserDTO userDto = userMapper.toDto(user, userService.getBatchId(user));
        return new LoginResponse(userDto, token);
    }

    public void logout(String token) {
        tokenBlacklistService.blacklist(token);
    }

    public UserDTO me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication != null ? authentication.getName() : null;
        if (email == null) {
            throw new IllegalStateException("Unauthenticated");
        }
        User user = userRepository.findByEmail(email);
        return userMapper.toDto(user, userService.getBatchId(user));
    }
}
