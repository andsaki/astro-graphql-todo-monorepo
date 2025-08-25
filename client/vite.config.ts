import { defineConfig } from 'vitest/config'

export default defineConfig({
  server: {
    proxy: {
      '/graphql': 'http://localhost:4000',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})