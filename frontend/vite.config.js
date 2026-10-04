import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.host) {
              proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
              const hostName = req.headers.host.split(':')[0];
              const domainParts = hostName.split('.');
              if (domainParts.length > 1) {
                const sub = domainParts[0].toLowerCase();
                if (sub !== 'localhost' && sub !== 'www' && sub !== 'app') {
                  proxyReq.setHeader('X-Tenant-Subdomain', sub);
                }
              }
            }
          });
        },
      },
      '/suite': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        secure: false,
      },
    },
  },
});
