// `import '@iyulab/house-style'` is a side-effect import of a stylesheet. TypeScript resolves a bare
// specifier through `exports` and cannot read `.css`, so with `noUncheckedSideEffectImports` (on in
// TypeScript 6 projects such as Vite's templates) the import fails to type-check. This empty module
// is what the `types` condition resolves to; the bundler still loads `styles/index.css`.
export {};
