package com.fintech;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(org.springframework.core.Ordered.LOWEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String REQUEST_ID_MDC_KEY = "requestId";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isBlank() || requestId.length() > 100) {
            requestId = UUID.randomUUID().toString();
        }

        long startedAt = System.nanoTime();
        MDC.put(REQUEST_ID_MDC_KEY, requestId);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long durationMs = (System.nanoTime() - startedAt) / 1_000_000;
            int status = response.getStatus();
            String message = "HTTP request completed: method={}, path={}, status={}, durationMs={}";
            if (status >= 500) {
                logger.error(message, request.getMethod(), request.getRequestURI(), status, durationMs);
            } else if (status >= 400) {
                logger.warn(message, request.getMethod(), request.getRequestURI(), status, durationMs);
            } else {
                logger.info(message, request.getMethod(), request.getRequestURI(), status, durationMs);
            }
            MDC.remove(REQUEST_ID_MDC_KEY);
        }
    }
}