package com.awais.hr.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.sql.DataSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtils jwtUtils;
    private final DataSource dataSource;

    public SecurityConfig(JwtUtils jwtUtils, DataSource dataSource) {
        this.jwtUtils = jwtUtils;
        this.dataSource = dataSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for stateless REST APIs
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow dynamic properties API version context paths
                .requestMatchers("/tenants/register", "/api/*/tenants/register").permitAll()
                .requestMatchers("/auth/**", "/api/*/auth/**").permitAll()
                .requestMatchers("/tenants/active/**", "/api/*/tenants/active/**").permitAll()
                .requestMatchers("/recruitment/jobs", "/api/*/recruitment/jobs").permitAll()
                .requestMatchers("/recruitment/apply", "/api/*/recruitment/apply").permitAll()
                .requestMatchers("/recruitment/candidates/**", "/api/*/recruitment/candidates/**").hasAnyRole("RECRUITER", "HR_MANAGER", "TENANT_ADMIN", "ADMIN")
                .requestMatchers("/org/**", "/api/*/org/**").authenticated()
                .requestMatchers("/error", "/api/*/error").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(new JwtAuthenticationFilter(jwtUtils, dataSource), org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
