package com.fintech;

import com.fintech.entity.JwtUtils;
import com.fintech.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull jakarta.servlet.http.HttpServletRequest request,
            @org.springframework.lang.NonNull jakarta.servlet.http.HttpServletResponse response,
            @org.springframework.lang.NonNull jakarta.servlet.FilterChain filterChain) throws jakarta.servlet.ServletException, IOException {

        // Skip filtering for error/forward dispatches to avoid double handling
        if (shouldBypass(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");

        // ✅ Missing header → block immediately
        if (header == null || !header.startsWith("Bearer ")) {
            sendUnauthorized(response, "Missing Authorization header");
            return;
        }

        String token = header.substring(7);

        // ✅ Invalid or expired token → block immediately
        if (!jwtUtils.validateToken(token)) {
            sendUnauthorized(response, "Invalid or expired token");
            return;
        }

        // ✅ Extract user from token
        Optional<User> userOpt = jwtUtils.getUserFromToken(token);
        if (userOpt.isEmpty()) {
            sendUnauthorized(response, "User not found for token");
            return;
        }

        User user = userOpt.get();

        // ✅ Set authentication
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        Collections.emptyList()
                );

        SecurityContextHolder.getContext().setAuthentication(auth);

        // ✅ Continue only after successful authentication
        filterChain.doFilter(request, response);
    }

    // Avoid running the filter for error/forward/include dispatches
    private boolean shouldBypass(HttpServletRequest request) {
        var dispatcherType = request.getDispatcherType();
        if (dispatcherType == jakarta.servlet.DispatcherType.ERROR
                || dispatcherType == jakarta.servlet.DispatcherType.FORWARD
                || dispatcherType == jakarta.servlet.DispatcherType.INCLUDE) {
            return true;
        }
        String uri = request.getRequestURI();
        if (uri == null) return false;
        // public/permitAll endpoints
        if (uri.startsWith("/api/auth") || uri.startsWith("/api/news")) return true;
        // Also skip the default error path
        return uri.startsWith("/error");
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
