package com.athlon.gateway.filter;

import com.athlon.gateway.security.JwtUtil;
import com.athlon.gateway.util.RequestUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Component
@Order(2)
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String token = RequestUtil.extractBearerToken(request);

        HeaderMapRequestWrapper requestWrapper = new HeaderMapRequestWrapper(request);
        // Strip caller-supplied identity headers by default
        requestWrapper.removeHeader("x-user-id");
        requestWrapper.removeHeader("x-user-uuid");
        requestWrapper.removeHeader("x-user-email");
        requestWrapper.removeHeader("x-user-role");

        if (token != null && jwtUtil.validateToken(token)) {
            String userId = jwtUtil.extractUserId(token);
            String userUuid = jwtUtil.extractUserUuid(token);
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);

            logger.debug("Authenticated User: Id={}, UUID={}, Email={}, Role={}", userId, userUuid, email, role);

            // Inject verified headers for downstream microservices
            if (userId != null && !userId.isBlank() && !userId.equals("null")) {
                if (userId.matches("\\d+")) {
                    requestWrapper.addHeader("X-User-Id", userId);
                } else if (userUuid == null || userUuid.isBlank() || userUuid.equals("null")) {
                    userUuid = userId;
                }
            }
            if (userUuid != null && !userUuid.isBlank() && !userUuid.equals("null")) {
                requestWrapper.addHeader("X-User-Uuid", userUuid);
            }
            if (email != null && !email.isBlank()) {
                requestWrapper.addHeader("X-User-Email", email);
            }
            if (role != null && !role.isBlank()) {
                requestWrapper.addHeader("X-User-Role", role);
            }
            
            filterChain.doFilter(requestWrapper, response);
            return;
        }

        filterChain.doFilter(requestWrapper, response);
    }

    private static class HeaderMapRequestWrapper extends HttpServletRequestWrapper {
        private final Map<String, String> customHeaders = new HashMap<>();
        private final java.util.Set<String> removedHeaders = new java.util.HashSet<>();

        public HeaderMapRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        public void addHeader(String name, String value) {
            this.removedHeaders.remove(name.toLowerCase());
            this.customHeaders.put(name.toLowerCase(), value);
        }

        public void removeHeader(String name) {
            this.customHeaders.remove(name.toLowerCase());
            this.removedHeaders.add(name.toLowerCase());
        }

        @Override
        public String getHeader(String name) {
            if (removedHeaders.contains(name.toLowerCase())) {
                return null;
            }
            String headerValue = customHeaders.get(name.toLowerCase());
            if (headerValue != null) {
                return headerValue;
            }
            return super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            java.util.List<String> names = new java.util.ArrayList<>();
            Enumeration<String> originalNames = super.getHeaderNames();
            while (originalNames.hasMoreElements()) {
                String original = originalNames.nextElement();
                if (!removedHeaders.contains(original.toLowerCase())) {
                    names.add(original);
                }
            }
            for (String customName : customHeaders.keySet()) {
                if (!names.contains(customName)) {
                    names.add(customName);
                }
            }
            return Collections.enumeration(names);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            if (removedHeaders.contains(name.toLowerCase())) {
                return Collections.emptyEnumeration();
            }
            String headerValue = customHeaders.get(name.toLowerCase());
            if (headerValue != null) {
                return Collections.enumeration(Collections.singletonList(headerValue));
            }
            return super.getHeaders(name);
        }
    }
}
