import { resolve } from 'path'
import { defineConfig, type Plugin } from 'vite'
import { SAMPLES } from './samples/catalog'

/** The separate apps beside the guide — each its own HTML entry and router, under its own path. */
const APPS = ['app/', ...SAMPLES.map((s) => `samples/${s.slug}/`)]

/**
 * Dev- and preview-server twin of the deploy workflow's `404.html`: a deep link under one of the
 * apps (`/house-style/app/orders/G-2026-0512`, a reload on any sample screen) is served that app's
 * `index.html`, not the guide's. Without it, Vite's single SPA fallback answered every unknown
 * path with the guide, whose router found no such page and rendered nothing — the published site
 * worked and the local servers did not. The preview server is where the accessibility check
 * follows in-app links, so without the twin there it opened the guide for every app deep link.
 */
function appDeepLinkFallback(): Plugin {
  const rewrite = (req: { url?: string; headers: { accept?: string } }, _res: unknown, next: () => void) => {
    const path = (req.url ?? '').split('?')[0]
    const app = APPS.find((a) => path.startsWith(`/house-style/${a}`))
    if (app && !/\.[a-z0-9]+$/i.test(path) && req.headers.accept?.includes('text/html')) req.url = `/house-style/${app}index.html`
    next()
  }
  return {
    name: 'house-style-app-deep-link-fallback',
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}

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
        // The sample apps come from `samples/catalog.ts`. They stay out of the guide ↔ reference-app
        // parity check, which reads the literal entries above: a sample shows one kind of app, not the
        // whole vocabulary the guide teaches.
        ...Object.fromEntries(SAMPLES.map((s) => [`sample-${s.slug}`, resolve(__dirname, `samples/${s.slug}/index.html`)])),
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
  plugins: [appDeepLinkFallback()],
})
