import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, /api calls are proxied to Spring Boot, so no CORS setup is needed.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'https://konnect-backend-h8g1.onrender.com' } },
});
