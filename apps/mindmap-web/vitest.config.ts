import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**', // Exclude E2E tests (run with Playwright)
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.config.ts',
        '**/*.d.ts',
        '**/types/**',
        'e2e/**', // Exclude E2E tests from coverage
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/app': path.resolve(__dirname, './app'),
      '@mindmap/domain': path.resolve(__dirname, '../../packages/domain/src'),
      '@mindmap/editor': path.resolve(__dirname, '../../packages/editor/src'),
      '@mindmap/sync': path.resolve(__dirname, '../../packages/sync/src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
})

