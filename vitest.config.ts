import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./apps/mindmap-web/vitest.setup.ts'],
    include: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/mindmap-web'),
      '@/components': path.resolve(__dirname, './apps/mindmap-web/components'),
      '@/lib': path.resolve(__dirname, './apps/mindmap-web/lib'),
      '@/app': path.resolve(__dirname, './apps/mindmap-web/app'),
      '@mindmap/domain': path.resolve(__dirname, './packages/domain/src'),
      '@mindmap/editor': path.resolve(__dirname, './packages/editor/src'),
      '@mindmap/sync': path.resolve(__dirname, './packages/sync/src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
})

