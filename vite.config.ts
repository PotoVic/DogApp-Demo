import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      manifest: false,

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webmanifest,woff2}',
        ],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})