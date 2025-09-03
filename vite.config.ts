import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './src/renderer',
  publicDir: 'public',
  base: './',
  css: {
    postcss: './postcss.config.js'
  },
  build: {
    outDir: '../../dist/renderer'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/renderer/components'),
      '@/hooks': resolve(__dirname, 'src/renderer/hooks'),
      '@/stores': resolve(__dirname, 'src/renderer/stores'),
      '@/types': resolve(__dirname, 'src/renderer/types'),
      '@/utils': resolve(__dirname, 'src/renderer/utils')
    }
  },
  server: {
    port: 3000
  }
})