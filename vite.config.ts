import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages project-site subpath: https://iyulab.github.io/house-style/
  base: '/house-style/',
  build: {
    target: 'esnext',
    outDir: 'publish',
    minify: true,
    copyPublicDir: true,
    emptyOutDir: true,
  },
  plugins: [],
})
