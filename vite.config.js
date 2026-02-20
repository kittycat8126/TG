import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // AlienVault OTX
      '/api/otx': {
        target: 'https://otx.alienvault.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/otx/, '/api/v1'),
        secure: true,
      },
      // AbuseIPDB
      '/api/abuse': {
        target: 'https://api.abuseipdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/abuse/, '/api/v2'),
        secure: true,
      },
      // Cloudflare Radar
      '/api/cloudflare': {
        target: 'https://api.cloudflare.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cloudflare/, '/client/v4/radar'),
        secure: true,
      },
    }
  }
})