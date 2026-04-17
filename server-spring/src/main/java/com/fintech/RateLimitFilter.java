package com.fintech;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Per-IP fixed-window rate limiting for /api routes.
 * Auth endpoints use a stricter limit; other API routes use a higher limit.
 */
@Component
@Order(org.springframework.core.Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MS = 60_000L;

    @Value("${rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${rate-limit.auth-requests-per-minute:25}")
    private int authRequestsPerMinute;

    @Value("${rate-limit.general-requests-per-minute:200}")
    private int generalRequestsPerMinute;

    @Value("${rate-limit.trust-x-forwarded-for:false}")
    private boolean trustXForwardedFor;

    private final ConcurrentHashMap<String, WindowCounter> windows = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Object> locks = new ConcurrentHashMap<>();

    private static final class WindowCounter {
        long windowStartMillis;
        int count;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!enabled) {
            return true;
        }
        String path = request.getRequestURI();
        return path == null || !path.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        boolean authBucket = path != null && path.startsWith("/api/auth");
        int max = authBucket ? authRequestsPerMinute : generalRequestsPerMinute;
        String ip = clientIp(request);
        String bucketKey = (authBucket ? "auth:" : "api:") + ip;

        if (!allow(bucketKey, max)) {
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.setHeader("Retry-After", "60");
            response.getWriter().write("{\"error\":\"Too many requests\",\"message\":\"Rate limit exceeded. Try again in a minute.\",\"retryAfterSeconds\":60}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        if (trustXForwardedFor) {
            String xff = request.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                return xff.split(",")[0].trim();
            }
        }
        String addr = request.getRemoteAddr();
        return addr != null ? addr : "unknown";
    }

    private boolean allow(String bucketKey, int maxPerWindow) {
        Object lock = locks.computeIfAbsent(bucketKey, k -> new Object());
        synchronized (lock) {
            long now = System.currentTimeMillis();
            WindowCounter w = windows.computeIfAbsent(bucketKey, k -> {
                WindowCounter c = new WindowCounter();
                c.windowStartMillis = now;
                c.count = 0;
                return c;
            });

            if (now - w.windowStartMillis >= WINDOW_MS) {
                w.windowStartMillis = now;
                w.count = 0;
            }

            if (w.count >= maxPerWindow) {
                return false;
            }
            w.count++;
            return true;
        }
    }
}
