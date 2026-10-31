# @advui/tsconfig

Shared TypeScript configs: `base.json` (strict, `noUncheckedIndexedAccess`,
bundler resolution), `library.json` and `nextjs.json`.

`base.json` allows imports that end in `.ts` and has `tsc` write them as `.js`
in `dist` (`rewriteRelativeImportExtensions`). The metadata entry points
(`<package>/meta`) import this way so that Node, which never adds an extension
itself, can load them from npm; Metro, Vite and Next.js resolve the `.ts` file
in the repo as written.
