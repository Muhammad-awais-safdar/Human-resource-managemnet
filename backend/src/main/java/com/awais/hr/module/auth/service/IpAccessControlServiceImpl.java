package com.awais.hr.module.auth.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;

@Service
@Transactional(readOnly = true)
public class IpAccessControlServiceImpl implements IpAccessControlService {

    private final DataSource dataSource;

    public IpAccessControlServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public boolean isIpAllowed(String clientIp) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        try {
            // Check if blacklist contains this IP
            Boolean isBlacklisted = jdbcTemplate.queryForObject(
                    "SELECT EXISTS(SELECT 1 FROM ip_restriction WHERE ip_address = ? AND type = 'DENY')",
                    Boolean.class, clientIp
            );
            if (isBlacklisted != null && isBlacklisted) {
                return false;
            }

            // Check if whitelist is active and if this IP is whitelisted
            Boolean whitelistExists = jdbcTemplate.queryForObject(
                    "SELECT EXISTS(SELECT 1 FROM ip_restriction WHERE type = 'ALLOW')",
                    Boolean.class
            );
            if (whitelistExists != null && whitelistExists) {
                Boolean isWhitelisted = jdbcTemplate.queryForObject(
                        "SELECT EXISTS(SELECT 1 FROM ip_restriction WHERE ip_address = ? AND type = 'ALLOW')",
                        Boolean.class, clientIp
                );
                return isWhitelisted != null && isWhitelisted;
            }
            return true;
        } catch (Exception e) {
            System.err.println("Warning: ip_restriction validation error - " + e.getMessage());
            return true; // Safe fallback to not block system operations if tables aren't ready
        }
    }
}
