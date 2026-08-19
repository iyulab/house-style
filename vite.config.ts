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
  //
  // @iyulab/components and @iyulab/data-components are workspace-linked (symlinked), so a
  // component reached only through this app's own bare imports (e.g. UButton.js) gets
  // pre-bundled by esbuild's dependency scanner, while the same underlying source file
  // reached through a linked package's own internal import (e.g. u-record-picker importing
  // USpinner) is served live and unbundled instead — two separate module instances for one
  // class, so its `@customElement(...)` decorator runs twice and the second registration
  // throws. Excluding both from optimizeDeps keeps every path to them unbundled and served
  // from the same on-disk file, so the browser's module cache dedupes them by URL.
  optimizeDeps: {
    exclude: ['@iyulab/router', '@iyulab/components', '@iyulab/data-components'],
    include: ['react-dom/client'],
  },
  plugins: [],
})
