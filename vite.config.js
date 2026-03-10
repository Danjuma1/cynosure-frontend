import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['framer-motion', '@headlessui/react', '@heroicons/react'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-utils': ['axios', 'zustand', 'react-hook-form', 'react-hot-toast', 'clsx', 'date-fns'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://cynosure-api.gravitylab.com.ng',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://cynosure-api.gravitylab.com.ng/ws',
        ws: true,
      },
    },
  },
})
