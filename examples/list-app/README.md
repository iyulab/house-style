# list-app — the house-style starter

The result of the guide's "Start here" steps: a Vite + Lit + TypeScript project with the house
preset loaded, the sidebar shell, and one list screen (`u-rich-table` with a filter row, status
tags and bulk actions).

```bash
npx degit iyulab/house-style/examples/list-app my-app
cd my-app
npm install
npm run dev
```

Start changing `src/ListScreenDemo.ts` (the columns and the data live in `src/constants.ts`), and
rename its tag in `src/main.ts` once the screen is yours.

These files are not kept by hand: before every deploy of the guide, a check builds this project
from the guide's own steps against the published packages, opens it in a browser, and fails if
the files here differ from what it built.
