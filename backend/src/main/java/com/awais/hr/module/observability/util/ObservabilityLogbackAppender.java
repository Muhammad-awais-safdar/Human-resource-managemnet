package com.awais.hr.module.observability.util;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;
import com.awais.hr.module.observability.service.LogStreamManager;

import java.util.Map;

public class ObservabilityLogbackAppender extends AppenderBase<ILoggingEvent> {

    private static LogStreamManager logStreamManager;

    public static void setLogStreamManager(LogStreamManager manager) {
        logStreamManager = manager;
    }

    @Override
    protected void append(ILoggingEvent eventObject) {
        if (logStreamManager == null || eventObject == null) {
            return;
        }

        try {
            String level = eventObject.getLevel() != null ? eventObject.getLevel().toString() : "INFO";
            String rawMessage = eventObject.getFormattedMessage();
            String redactedMessage = PiiRedactorUtil.redactSensitiveData(rawMessage);

            Map<String, String> mdcPropertyMap = eventObject.getMDCPropertyMap();
            String tenantId = mdcPropertyMap != null ? mdcPropertyMap.getOrDefault("tenantId", "awais") : "awais";
            String traceId = mdcPropertyMap != null ? mdcPropertyMap.getOrDefault("traceId", "tr-sys") : "tr-sys";
            String module = mdcPropertyMap != null ? mdcPropertyMap.getOrDefault("module", "system") : "system";
            String clientIp = mdcPropertyMap != null ? mdcPropertyMap.getOrDefault("clientIp", "127.0.0.1") : "127.0.0.1";

            if (module == null || "system".equalsIgnoreCase(module)) {
                String loggerName = eventObject.getLoggerName();
                if (loggerName != null) {
                    int lastDot = loggerName.lastIndexOf('.');
                    module = lastDot > 0 ? loggerName.substring(lastDot + 1).toLowerCase() : loggerName;
                }
            }

            logStreamManager.addLog(level, module, tenantId, traceId, redactedMessage, clientIp);
        } catch (Exception ignored) {}
    }
}
