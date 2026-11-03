package com.ecommerce.backend.config;

import com.ecommerce.backend.common.util.JwtUtils;
import com.ecommerce.backend.modules.user.entity.UserStatus;
import com.ecommerce.backend.modules.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null
                && authHeader.startsWith("Bearer ")
                && SecurityContextHolder.getContext()
                .getAuthentication() == null) {

            String token = authHeader.substring(7);

            if (jwtUtils.validateAccessToken(token)) {
                String email = jwtUtils.getEmailFromToken(token);

                userRepository.findByEmail(email).filter(user ->
                                user.getStatus() == UserStatus.ACTIVE
                        )
                        .ifPresent(user -> {var authorities = List.of(new SimpleGrantedAuthority(
                                            user.getRole().name()
                                    )
                            );

                            var authentication = new UsernamePasswordAuthenticationToken(
                                            user.getEmail(),
                                            null,
                                            authorities
                                    );

                            authentication.setDetails(new WebAuthenticationDetailsSource()
                                            .buildDetails(request)
                            );

                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        });
            }
        }

        filterChain.doFilter(request, response);
    }
}