import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // Existing API proxy
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },

      // WebSocket proxy for /ws
      '/ws': {
        target: 'ws://localhost:4000', // backend WS port
        ws: true,                      // <-- enables WebSocket proxying
        changeOrigin: true
      }
    }
  }
});
