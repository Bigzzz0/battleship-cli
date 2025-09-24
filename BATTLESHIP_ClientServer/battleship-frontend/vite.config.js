import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')?.[1] ?? ''
const basePath = isGitHubActions && repositoryName ? `/${repositoryName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
