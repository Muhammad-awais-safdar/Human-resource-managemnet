package com.awais.hr.module.observability.service;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class LogStreamManager {

    private static final int MAX_BUFFER_SIZE = 1000;
    private final List<Map<String, Object>> ringBuffer = new CopyOnWriteArrayList<>();
    private final Set<SseEmitter> activeEmitters = ConcurrentHashMap.newKeySet();

    public LogStreamManager() {
        // Pre-fill ring buffer with system startup events
        long now = System.currentTimeMillis();
        addLog("INFO", "system", "awais", "tr-start-01", "Awais HR Engine initialized with Zero-Latency Log Streamer", "127.0.0.1");
        addLog("INFO", "security", "awais", "tr-start-02", "Stateless JWT authentication filter active with AOP @HasPermission guards", "127.0.0.1");
        addLog("INFO", "billing", "awais", "tr-start-03", "Enterprise Payment Engine ready (Stripe, Paddle, JazzCash, EasyPaisa, Raast)", "127.0.0.1");
    }

    public synchronized void addLog(String level, String module, String tenantId, String traceId, String message, String ip) {
        Map<String, Object> logEntry = new LinkedHashMap<>();
        logEntry.put("timestamp", new Date());
        logEntry.put("level", level);
        logEntry.put("module", module);
        logEntry.put("tenantId", tenantId != null ? tenantId : "awais");
        logEntry.put("traceId", traceId != null ? traceId : "tr-" + UUID.randomUUID().toString().substring(0, 8));
        logEntry.put("message", message);
        logEntry.put("ip", ip != null ? ip : "127.0.0.1");

        ringBuffer.add(logEntry);
        if (ringBuffer.size() > MAX_BUFFER_SIZE) {
            ringBuffer.remove(0);
        }

        // Broadcast to active SSE emitters (0-latency tail -f streaming)
        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : activeEmitters) {
            try {
                emitter.send(SseEmitter.event().name("log-event").data(logEntry));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }
        activeEmitters.removeAll(deadEmitters);
    }

    public List<Map<String, Object>> getTailLogs(int lines) {
        int count = lines > 0 ? lines : 330;
        int size = ringBuffer.size();
        if (size <= count) {
            return new ArrayList<>(ringBuffer);
        }
        return new ArrayList<>(ringBuffer.subList(size - count, size));
    }

    public SseEmitter createStreamEmitter() {
        SseEmitter emitter = new SseEmitter(0L); // Infinite timeout for live streaming
        activeEmitters.add(emitter);

        emitter.onCompletion(() -> activeEmitters.remove(emitter));
        emitter.onTimeout(() -> activeEmitters.remove(emitter));
        emitter.onError((e) -> activeEmitters.remove(emitter));

        // Send recent buffer history on connect
        try {
            for (Map<String, Object> prev : getTailLogs(50)) {
                emitter.send(SseEmitter.event().name("log-event").data(prev));
            }
        } catch (IOException ignored) {}

        return emitter;
    }
}
