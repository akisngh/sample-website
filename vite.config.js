import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { writeFileSync, readFileSync } from 'fs'

function copy404Plugin() {
  return {
    name: 'copy-404',
    closeBundle() {
      const index = readFileSync(resolve('dist/index.html'), 'utf-8')
      writeFileSync(resolve('dist/404.html'), index)
    },
  }
}

export default defineConfig({
  plugins: [react(), copy404Plugin()],
  base: '/sample-website/',
})
