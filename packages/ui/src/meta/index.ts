// `@advui/core/meta`: the metadata schema and `defineMeta`, which every
// package's `*.meta.ts` uses, and the metadata of the core components, for
// tools that build on it (the AdvUI Builder). `@advui/data/meta`,
// `@advui/charts/meta` and `@advui/editor/meta` list their own components.
// Tools import it in Node, which needs the extension on every relative import:
// `tsc` writes these `.ts` imports as `.js` in `dist`.
export * from './types.ts'
export { components } from './components.ts'
