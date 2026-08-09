# House Style

A reference guide and living demo for the iyulab house design style, built on
`@iyulab/components`, `@iyulab/enterprise` and `@iyulab/modern-app`.

This is not a published npm package — it is a website. Every value shown on it
(type scale, radius, elevation) is read live from the design tokens actually
loaded on the page, so the guide cannot drift out of sync with its own source.
Where a design decision has not been made yet, the page says so plainly instead
of inventing one.

**Live**: https://iyulab.github.io/house-style/

## Local development

From the `node-packages` monorepo root (never from inside this directory):

```bash
npm install
npm run start -w @iyulab/house-style
```

## License

MIT
