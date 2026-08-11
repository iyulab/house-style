import { resolve } from 'path'
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
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app/index.html'),
      },
    },
  },
  // @iyulab/router dynamically imports react-dom/client to render React route content.
  // Under Vite's dev pre-bundling this CommonJS interop breaks unless react-dom/client is
  // pre-bundled while the router itself is left unbundled (documented in @iyulab/router's
  // README under "React + Vite").
  optimizeDeps: {
    exclude: ['@iyulab/router'],
    include: ['react-dom/client'],
  },
  plugins: [],
})
