import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@mindmap/domain': path.resolve(__dirname, '../domain/src'),
      '@mindmap/testing': path.resolve(__dirname, '../testing/src'),
    },
  },
})

