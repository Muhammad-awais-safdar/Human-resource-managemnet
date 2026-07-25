package com.awais.hr.module.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;

@Service
@Transactional(readOnly = true)
public class IpAccessControlServiceImpl implements IpAccessControlService {

    private static final Logger log = LoggerFactory.getLogger(IpAccessControlServiceImpl.class);
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
                log.warn("[IP RESTRICTION] Access denied for blacklisted IP: {}", clientIp);
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
                boolean allowed = isWhitelisted != null && isWhitelisted;
                if (!allowed) {
                    log.warn("[IP RESTRICTION] Access denied for non-whitelisted IP: {}", clientIp);
                }
                return allowed;
            }
            return true;
        } catch (Exception e) {
            log.warn("Warning: ip_restriction validation note - {}", e.getMessage());
            return true; // Safe fallback to not block system operations if tables aren't ready
        }
    }
}

