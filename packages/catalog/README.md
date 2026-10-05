# @advui/catalog (private)

The generated component catalog: the metadata and examples of every component
package (`@advui/core`, `@advui/data`, `@advui/charts`, `@advui/editor`), with
the package each component ships in. The docs site and the Expo app read it:

```ts
import { components, packages, getComponent } from '@advui/catalog'
import { examples } from '@advui/catalog/examples'
```

`src/index.ts` and `src/examples.ts` are written by `pnpm catalog`
(`scripts/generate-catalog.mjs`); do not edit them by hand. `src/roadmap.ts`
lists planned components. `src/validate.ts` checks what tools read from the
metadata (closed `options`, child rules and the part names they use); the
generator and `pnpm --filter @advui/catalog test` both run it. This package is
not published: it imports every component package, which no published package
may do.
