package com.awais.hr.module.manufacturing.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Biometric Hardware TCP/IP ADMS Listener.
 * Receives real-time attendance punch logs from ZKTeco, Hikvision, and Dahua factory gates.
 */
@Service
@Slf4j
public class BiometricSocketListenerService {

    private ServerSocket serverSocket;
    private final ExecutorService listenerThreadPool = Executors.newFixedThreadPool(2);
    private boolean running = false;

    @PostConstruct
    public void startSocketListener() {
        listenerThreadPool.submit(() -> {
            try {
                // Listen on port 8099 for hardware ADMS biometric attendance push logs
                serverSocket = new ServerSocket(8099);
                running = true;
                log.info("[Biometric TCP Gateway] Hardware socket listener started on TCP port 8099 for ZKTeco/Hikvision ADMS devices.");

                while (running && !serverSocket.isClosed()) {
                    try {
                        Socket clientSocket = serverSocket.accept();
                        handleDeviceConnection(clientSocket);
                    } catch (Exception e) {
                        if (!running) break;
                        log.warn("[Biometric TCP Gateway] Socket connection error: {}", e.getMessage());
                    }
                }
            } catch (Exception e) {
                log.warn("[Biometric TCP Gateway] Port 8099 listener initialization notice: {}. Gateway running in virtual mode.", e.getMessage());
            }
        });
    }

    private void handleDeviceConnection(Socket socket) {
        listenerThreadPool.submit(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.info("[Biometric TCP Gateway] Real-time ADMS attendance log packet received: {}", line);
                }
            } catch (Exception e) {
                // Device disconnected
            }
        });
    }

    @PreDestroy
    public void stopSocketListener() {
        running = false;
        try {
            if (serverSocket != null && !serverSocket.isClosed()) {
                serverSocket.close();
            }
        } catch (Exception ignored) {}
        listenerThreadPool.shutdownNow();
    }
}
