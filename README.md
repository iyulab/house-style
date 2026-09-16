# House Style

A reference guide and living demo for the iyulab house design style, built on
`@iyulab/components`, `@iyulab/enterprise` and `@iyulab/modern-app`.

This is not a published npm package — it is a website. Every value shown on it
(type scale, radius, elevation) is read live from the design tokens actually
loaded on the page, so the guide cannot drift out of sync with its own source.
Where a design decision has not been made yet, the page says so plainly instead
of inventing one.

**Live**: https://iyulab.github.io/house-style/ — this is the guide. There is no
separate docs site; the page above is the only place to read it.

The live page is organized into sections:

- **Visual identity & tokens** — type scale, radius, elevation
- **Layout & viewport** — the responsive sidebar shell, nav/routes, breakpoints
- **Component depth** — surfaces and controls at the standard radius and elevation
- **Data patterns** — how tabular/record data is presented
- **Feedback & motion** — alerts, progress, and waiting states
- **User flows** — CRUD, wizard, and bulk-action patterns
- **Voice, tone & accessibility** — focus visibility and keyboard interaction

## The reference app

The guide has a second half: a small but working line-of-business app, assembled only from
these libraries, at **https://iyulab.github.io/house-style/app/** (sign in with `demo` / `demo`
— the backend is mocked in the browser, there are no real accounts). It is reachable from the
guide's sidebar under "Open the reference app".

Where the guide shows each pattern on its own, the app shows them load-bearing: a sidebar shell,
a list screen with filtering, selection and bulk actions, a master-detail order screen with an
edit drawer, and a multi-step wizard. It is held to the guide rather than kept beside it — a
check in this monorepo compares the two and reports any layout primitive one half uses and the
other does not.

Sections that say "Not yet decided" mean exactly that — no design decision has
been made for that area yet, rather than the guide inventing one.

## Local development

From the `node-packages` monorepo root (never from inside this directory):

```bash
npm install
npm run start -w @iyulab/house-style
```

## License

MIT
