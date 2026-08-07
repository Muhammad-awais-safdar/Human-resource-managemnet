package com.awais.hr.module.observability.metrics;

import com.awais.hr.context.TenantContextHolder;
import io.micrometer.core.instrument.Tag;
import io.micrometer.core.instrument.Tags;
import io.micrometer.core.instrument.config.MeterFilter;
import io.micrometer.core.instrument.config.MeterFilterReply;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;

/**
 * Enterprise Multi-Tenant MeterRegistry Customizer for Micrometer.
 * Attaches tenant and infrastructure tags to all emitted metrics.
 */
@Component
public class MultiTenantMetricsCustomizer implements MeterRegistryCustomizer<MeterRegistry> {

    @Override
    public void customize(MeterRegistry registry) {
        String hostname = "unknown-host";
        try {
            hostname = InetAddress.getLocalHost().getHostName();
        } catch (Exception ignored) {}

        final String instanceHost = hostname;

        registry.config().commonTags(
                "environment", "production",
                "region", "us-east-1",
                "service", "hr-engine",
                "instance", instanceHost
        );

        registry.config().meterFilter(new MeterFilter() {
            @Override
            public MeterFilterReply accept(io.micrometer.core.instrument.Meter.Id id) {
                return MeterFilterReply.ACCEPT;
            }

            @Override
            public io.micrometer.core.instrument.Meter.Id map(io.micrometer.core.instrument.Meter.Id id) {
                String tenant = TenantContextHolder.getCurrentTenant();
                if (tenant == null || tenant.isBlank()) {
                    tenant = "system";
                }
                
                List<Tag> tags = new ArrayList<>();
                id.getTags().forEach(tags::add);
                
                // Add tenant context tags if not already present
                if (tags.stream().noneMatch(t -> t.getKey().equals("tenantId"))) {
                    tags.add(Tag.of("tenantId", tenant));
                }
                if (tags.stream().noneMatch(t -> t.getKey().equals("tenantName"))) {
                    tags.add(Tag.of("tenantName", tenant));
                }
                if (tags.stream().noneMatch(t -> t.getKey().equals("plan"))) {
                    tags.add(Tag.of("plan", "enterprise"));
                }
                if (tags.stream().noneMatch(t -> t.getKey().equals("subscription"))) {
                    tags.add(Tag.of("subscription", "active"));
                }

                return id.replaceTags(Tags.of(tags));
            }
        });
    }
}
