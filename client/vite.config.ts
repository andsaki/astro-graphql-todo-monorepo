import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/graphql': 'http://localhost:4000',
    },
  },
})