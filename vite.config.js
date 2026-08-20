import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('firebase')) return 'firebase-vendor';
            if (id.includes('framer-motion')) return 'framer-vendor';
            if (id.includes('lucide') || id.includes('zustand')) return 'ui-vendor';
            return 'vendor'; // all other deps
          }
        }
      }
    }
  },
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        importScripts: ['/firebase-messaging-sw.js'],
        navigateFallbackDenylist: [/^\/sitemap\.xml$/, /^\/sitemap\//, /\.xml$/]
      },
      includeAssets: ['favicon.png', 'og-image.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Pratham Karigiri',
        short_name: 'Pratham Karigiri',
        description: 'Authentic handcrafted woolen products and crochet bouquets.',
        theme_color: '#5C4033',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
