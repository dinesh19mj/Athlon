package com.athlon.gateway.filter;

import com.athlon.gateway.util.IpUtil;
import com.athlon.gateway.util.RequestUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestId = RequestUtil.generateRequestId();
        request.setAttribute("requestId", requestId);
        request.setAttribute("startTime", System.currentTimeMillis());

        String method = request.getMethod();
        String uri = request.getRequestURI();
        String clientIp = IpUtil.getClientIpAddress(request);

        logger.info("INCOMING REQUEST | ID: {} | IP: {} | Method: {} | URI: {}",
                requestId, clientIp, method, uri);

        filterChain.doFilter(request, response);
    }
}
