package com.awais.hr.module.marketplace.service;

import com.awais.hr.context.TenantContextHolder;
import com.awais.hr.module.marketplace.sandbox.PluginSandboxEngine;
import com.awais.hr.module.superadmin.service.ModuleManagementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.io.File;
import java.util.*;

@Service
@Transactional
public class MarketplaceServiceImpl implements MarketplaceService {

    private static final Logger log = LoggerFactory.getLogger(MarketplaceServiceImpl.class);
    private final DataSource dataSource;
    private final PluginSandboxEngine pluginSandboxEngine;
    private final ModuleManagementService moduleManagementService;

    public MarketplaceServiceImpl(DataSource dataSource) {
        this(dataSource, new PluginSandboxEngine(), null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public MarketplaceServiceImpl(DataSource dataSource, PluginSandboxEngine pluginSandboxEngine, @org.springframework.context.annotation.Lazy ModuleManagementService moduleManagementService) {
        this.dataSource = dataSource;
        this.pluginSandboxEngine = pluginSandboxEngine;
        this.moduleManagementService = moduleManagementService;
    }

    private String resolveCurrentTenant() {
        String tenant = TenantContextHolder.getCurrentTenant();
        if (tenant == null || tenant.isBlank()) {
            return "MASTER";
        }
        return tenant;
    }

    private void ensureTableExists(JdbcTemplate jdbc, String tenantId) {
        try {
            jdbc.execute("CREATE TABLE IF NOT EXISTS marketplace_plugin (" +
                    "id VARCHAR(36) PRIMARY KEY, " +
                    "tenant_id VARCHAR(100) NOT NULL DEFAULT 'MASTER', " +
                    "plugin_name VARCHAR(100) NOT NULL, " +
                    "module_key VARCHAR(50), " +
                    "category VARCHAR(50) NOT NULL DEFAULT 'GENERAL', " +
                    "description TEXT, " +
                    "icon VARCHAR(20) DEFAULT '🔌', " +
                    "vendor VARCHAR(100) NOT NULL DEFAULT 'COMMUNITY', " +
                    "version VARCHAR(20) NOT NULL DEFAULT '1.0.0', " +
                    "is_installed BOOLEAN NOT NULL DEFAULT FALSE, " +
                    "created_at TIMESTAMP NOT NULL DEFAULT NOW())");

            try { jdbc.execute("ALTER TABLE marketplace_plugin ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100) DEFAULT 'MASTER'"); } catch (Exception ignored) {}
            try { jdbc.execute("UPDATE marketplace_plugin SET tenant_id = 'MASTER' WHERE tenant_id IS NULL"); } catch (Exception ignored) {}
            try { jdbc.execute("ALTER TABLE marketplace_plugin ADD COLUMN IF NOT EXISTS module_key VARCHAR(50)"); } catch (Exception ignored) {}
            try { jdbc.execute("ALTER TABLE marketplace_plugin ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'GENERAL'"); } catch (Exception ignored) {}
            try { jdbc.execute("ALTER TABLE marketplace_plugin ADD COLUMN IF NOT EXISTS description TEXT"); } catch (Exception ignored) {}
            try { jdbc.execute("ALTER TABLE marketplace_plugin ADD COLUMN IF NOT EXISTS icon VARCHAR(20) DEFAULT '🔌'"); } catch (Exception ignored) {}

            Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM marketplace_plugin WHERE tenant_id = ?", Integer.class, tenantId);
            if (count != null && count == 0) {
                jdbc.update("INSERT INTO marketplace_plugin (id, tenant_id, plugin_name, module_key, category, description, icon, vendor, version, is_installed) VALUES " +
                        "(?, ?, 'Recruitment & ATS Engine', 'RECRUITMENT', 'TALENT', 'Applicant tracking, job requisitions, candidate pipelines, and AI resume parsing', '💼', 'Awais HR Core', '2.5.0', true), " +
                        "(?, ?, 'Payroll & Salary Disbursements', 'PAYROLL', 'FINANCE', 'Multi-currency payroll engine, batch salary payouts, and tax withholding', '💰', 'Awais HR Core', '3.1.0', true), " +
                        "(?, ?, 'Attendance & Shift Management', 'ATTENDANCE', 'WORKFORCE', 'Biometric tracking, shift rosters, geofenced clock-in, and overtime rules', '📅', 'Awais HR Core', '2.2.0', true), " +
                        "(?, ?, 'Expense Claim Portal', 'EXPENSE', 'FINANCE', 'Expense reimbursement claims, policy thresholds, and OCR receipt parsing', '💳', 'Awais HR Core', '1.9.0', true), " +
                        "(?, ?, 'Hardware & Device Asset Tracking', 'ASSET', 'OPERATIONS', 'Hardware asset allocation, device tracking, and maintenance logs', '📦', 'Awais HR Core', '1.8.0', true), " +
                        "(?, ?, 'Performance & 360 Reviews', 'PERFORMANCE', 'TALENT', '360 appraisal reviews, OKR goal tracking, and merit matrices', '📈', 'Awais HR Core', '2.0.0', true), " +
                        "(?, ?, 'LMS & Employee Training', 'LEARNING', 'TALENT', 'Employee onboarding courses, certifications, and skill compliance', '🎓', 'Awais HR Core', '1.5.0', true), " +
                        "(?, ?, 'AI HR Copilot & Document Intelligence', 'AICOPILOT', 'INNOVATION', 'Natural language HR assistant, document summary, and predictive analytics', '🤖', 'Awais HR AI Labs', '3.0.0', true), " +
                        "(?, ?, 'Agritech Crop & Farm Yield Engine', 'CROP_YIELD', 'OPERATIONS', 'Farm workforce allocation, seasonal crop yield forecasting, and field logs', '🌾', 'Awais HR Enterprise', '1.2.0', true), " +
                        "(?, ?, 'Slack Notifications Gateway', 'SLACK_BOT', 'COMMUNICATION', 'Receive instant Slack notifications for leave approvals and attendance digests', '💬', 'Slack Technologies', '2.4.0', false), " +
                        "(?, ?, 'ZKTeco Biometric Hardware Listener', 'BIOMETRIC_GW', 'HARDWARE', 'Real-time TCP/IP push listener for physical attendance turnstiles', '🔑', 'ZKTeco Labs', '4.0.1', false), " +
                        "(?, ?, 'WhatsApp Payslip Delivery Gateway', 'WHATSAPP_GW', 'COMMUNICATION', 'Send PDF payslips directly to employee WhatsApp accounts', '📱', 'Meta Business', '1.8.2', false)",
                        UUID.randomUUID().toString(), tenantId,
                        UUID.randomUUID().toString(), tenantId,
                        UUID.randomUUID().toString(), tenantId,
                        UUID.randomUUID().toString(), tenantId,
                        UUID.randomUUID().toString(), tenantId,
                        UUID.randomUUID().toString(), tenantId,
                        UUID.randomUUID().toString(), tenantId,
                        UUID.randomUUID().toString(), tenantId,
                        UUID.randomUUID().toString(), tenantId,
                        UUID.randomUUID().toString(), tenantId,
                        UUID.randomUUID().toString(), tenantId,
                        UUID.randomUUID().toString(), tenantId
                );
            }
        } catch (Exception e) {
            log.warn("Marketplace plugin tenant table check/seed notice: {}", e.getMessage());
        }
    }

    @Override
    public List<Map<String, Object>> getPlugins() {
        String tenantId = resolveCurrentTenant();
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTableExists(jdbc, tenantId);
        return jdbc.queryForList("SELECT id, tenant_id, plugin_name, module_key, category, description, icon, vendor, version, is_installed, created_at FROM marketplace_plugin WHERE tenant_id = ? ORDER BY created_at DESC", tenantId);
    }

    @Override
    public Map<String, Object> installPlugin(Map<String, Object> body) {
        String tenantId = resolveCurrentTenant();
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTableExists(jdbc, tenantId);

        String name = (String) body.get("pluginName");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Plugin name is required.");
        }
        String vendor = body.get("vendor") != null ? (String) body.get("vendor") : "COMMUNITY";
        String version = body.get("version") != null ? (String) body.get("version") : "1.0.0";
        String moduleKey = body.get("moduleKey") != null ? (String) body.get("moduleKey") : deriveModuleKey(name);
        String category = body.get("category") != null ? (String) body.get("category") : "GENERAL";
        String description = body.get("description") != null ? (String) body.get("description") : "Custom plugin extension package";
        String icon = body.get("icon") != null ? (String) body.get("icon") : "🔌";

        // Check if plugin exists for THIS TENANT ONLY
        List<Map<String, Object>> existing = jdbc.queryForList("SELECT id FROM marketplace_plugin WHERE tenant_id = ? AND LOWER(plugin_name) = LOWER(?)", tenantId, name.trim());
        if (!existing.isEmpty()) {
            String existingId = (String) existing.get(0).get("id");
            jdbc.update("UPDATE marketplace_plugin SET is_installed = TRUE, version = ?, vendor = ? WHERE id = ? AND tenant_id = ?", version, vendor, existingId, tenantId);
            syncTenantModuleOverride(tenantId, moduleKey, true);
            log.info("Tenant [{}] updated/re-activated isolated plugin: id={} name={}", tenantId, existingId, name);
            return Map.of("id", existingId, "tenantId", tenantId, "pluginName", name, "vendor", vendor, "version", version, "isInstalled", true);
        }

        String id = UUID.randomUUID().toString();
        jdbc.update("INSERT INTO marketplace_plugin (id, tenant_id, plugin_name, module_key, category, description, icon, vendor, version, is_installed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)",
                id, tenantId, name.trim(), moduleKey, category, description, icon, vendor, version);
        syncTenantModuleOverride(tenantId, moduleKey, true);
        log.info("Tenant [{}] installed isolated plugin: id={} name={}", tenantId, id, name);
        return Map.of("id", id, "tenantId", tenantId, "pluginName", name, "vendor", vendor, "version", version, "isInstalled", true);
    }

    @Override
    public Map<String, Object> togglePlugin(String id, boolean enabled) {
        String tenantId = resolveCurrentTenant();
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTableExists(jdbc, tenantId);

        List<Map<String, Object>> rows = jdbc.queryForList("SELECT module_key, plugin_name FROM marketplace_plugin WHERE id = ? AND tenant_id = ?", id, tenantId);
        int updated = jdbc.update("UPDATE marketplace_plugin SET is_installed = ? WHERE id = ? AND tenant_id = ?", enabled, id, tenantId);
        if (updated == 0) {
            throw new IllegalArgumentException("Plugin not found for current tenant with ID: " + id);
        }

        if (!rows.isEmpty()) {
            String moduleKey = (String) rows.get(0).get("module_key");
            String pluginName = (String) rows.get(0).get("plugin_name");
            if (moduleKey == null) moduleKey = deriveModuleKey(pluginName);
            syncTenantModuleOverride(tenantId, moduleKey, enabled);
        }

        log.info("Tenant [{}] toggled isolated plugin: id={} isInstalled={}", tenantId, id, enabled);
        return Map.of("id", id, "tenantId", tenantId, "isInstalled", enabled);
    }

    @Override
    public Map<String, Object> uninstallPlugin(String id) {
        String tenantId = resolveCurrentTenant();
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        ensureTableExists(jdbc, tenantId);

        List<Map<String, Object>> rows = jdbc.queryForList("SELECT module_key, plugin_name FROM marketplace_plugin WHERE id = ? AND tenant_id = ?", id, tenantId);
        int updated = jdbc.update("DELETE FROM marketplace_plugin WHERE id = ? AND tenant_id = ?", id, tenantId);
        if (updated == 0) {
            throw new IllegalArgumentException("Plugin not found for current tenant with ID: " + id);
        }

        if (!rows.isEmpty()) {
            String moduleKey = (String) rows.get(0).get("module_key");
            String pluginName = (String) rows.get(0).get("plugin_name");
            if (moduleKey == null) moduleKey = deriveModuleKey(pluginName);
            syncTenantModuleOverride(tenantId, moduleKey, false);
        }

        log.info("Tenant [{}] uninstalled isolated plugin: id={}", tenantId, id);
        return Map.of("success", true, "id", id, "tenantId", tenantId, "message", "Plugin uninstalled for current tenant.");
    }

    @Override
    public Map<String, Object> uploadAndInstallPluginBundle(File tempFile, String originalFilename) {
        PluginSandboxEngine.SandboxValidationResult validation = pluginSandboxEngine.validatePluginBundle(tempFile);
        if (!validation.isValid()) {
            throw new IllegalArgumentException(validation.getMessage());
        }

        Map<String, Object> details = validation.getManifestDetails();
        String pluginName = details != null && details.get("pluginName") != null ? (String) details.get("pluginName") : originalFilename.replace(".zip", "");
        String vendor = details != null && details.get("vendor") != null ? (String) details.get("vendor") : "Custom Developer";
        String version = details != null && details.get("version") != null ? (String) details.get("version") : "1.0.0";

        Map<String, Object> installResult = installPlugin(Map.of(
            "pluginName", pluginName,
            "vendor", vendor,
            "version", version
        ));

        log.info("Uploaded plugin bundle verified by sandbox for tenant [{}] and installed: name={}", resolveCurrentTenant(), pluginName);
        return Map.of(
            "success", true,
            "message", "Plugin bundle passed security sandbox inspection and was installed for your tenant workspace!",
            "plugin", installResult
        );
    }

    private void syncTenantModuleOverride(String tenantId, String moduleKey, boolean enabled) {
        if (moduleManagementService != null && moduleKey != null && !moduleKey.isBlank()) {
            try {
                moduleManagementService.toggleGlobalModule(moduleKey, enabled);
                moduleManagementService.setTenantModuleOverride(tenantId, moduleKey, enabled);
            } catch (Exception e) {
                log.warn("Failed to sync tenant module override for tenantId={} moduleKey={}: {}", tenantId, moduleKey, e.getMessage());
            }
        }
    }

    private String deriveModuleKey(String pluginName) {
        if (pluginName == null) return null;
        String lower = pluginName.toLowerCase();
        if (lower.contains("recruitment") || lower.contains("ats")) return "RECRUITMENT";
        if (lower.contains("payroll") || lower.contains("salary")) return "PAYROLL";
        if (lower.contains("attendance") || lower.contains("shift")) return "ATTENDANCE";
        if (lower.contains("expense")) return "EXPENSE";
        if (lower.contains("asset") || lower.contains("hardware")) return "ASSET";
        if (lower.contains("performance") || lower.contains("review") || lower.contains("appraisal")) return "PERFORMANCE";
        if (lower.contains("learning") || lower.contains("lms") || lower.contains("training")) return "LEARNING";
        if (lower.contains("crop") || lower.contains("farm") || lower.contains("agritech")) return "CROP_YIELD";
        if (lower.contains("copilot") || lower.contains("ai")) return "AICOPILOT";
        return null;
    }
}
