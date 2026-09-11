package com.fintech;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintech.entity.JwtUtils;
import com.fintech.entity.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Set<String> PUBLIC_PREFIXES = Set.of(
            "/api/auth",
            "/api/news",
            "/api/search",
            "/api/contact",
            "/actuator/health",
            "/actuator/info"
    );

    @Autowired
    private JwtUtils jwtUtils;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull jakarta.servlet.FilterChain filterChain) throws jakarta.servlet.ServletException, IOException {

        if (shouldBypass(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            sendUnauthorized(response, "Missing Authorization header");
            return;
        }

        String token = header.substring(7).trim();
        if (token.isEmpty()) {
            sendUnauthorized(response, "Missing Authorization header");
            return;
        }

        if (!jwtUtils.validateToken(token)) {
            sendUnauthorized(response, "Invalid or expired token");
            return;
        }

        Optional<User> userOpt = jwtUtils.getUserFromToken(token);
        if (userOpt.isEmpty()) {
            sendUnauthorized(response, "User not found for token");
            return;
        }

        User user = userOpt.get();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());

        SecurityContextHolder.getContext().setAuthentication(auth);
        filterChain.doFilter(request, response);
    }

    private boolean shouldBypass(HttpServletRequest request) {
        var dispatcherType = request.getDispatcherType();
        if (dispatcherType == jakarta.servlet.DispatcherType.ERROR
                || dispatcherType == jakarta.servlet.DispatcherType.FORWARD
                || dispatcherType == jakarta.servlet.DispatcherType.INCLUDE) {
            return true;
        }

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String uri = request.getRequestURI();
        if (uri == null) {
            return false;
        }

        for (String prefix : PUBLIC_PREFIXES) {
            if (uri.startsWith(prefix)) {
                return true;
            }
        }

        return uri.startsWith("/error");
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        objectMapper.writeValue(response.getWriter(), Map.of("error", message));
    }
}
