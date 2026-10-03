package com.awais.hr.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.core.task.support.TaskExecutorAdapter;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executors;

@Configuration
@EnableAsync
public class VirtualThreadConfig {

    private static final Logger log = LoggerFactory.getLogger(VirtualThreadConfig.class);

    @Bean(name = "applicationTaskExecutor")
    public AsyncTaskExecutor applicationTaskExecutor() {
        log.info("⚡ Initializing Java 21 Virtual Thread Executor (Project Loom) for High-Throughput Enterprise Concurrency...");
        return new TaskExecutorAdapter(Executors.newVirtualThreadPerTaskExecutor());
    }
}
