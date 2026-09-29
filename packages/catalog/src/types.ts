import type { ComponentMeta } from '@advui/core/meta'

/** A published component package, as the docs group and install it. */
export interface ComponentPackage {
  /** npm name, e.g. `@advui/data`. */
  name: string
  /** Short label for navigation, e.g. "Data". */
  title: string
  description: string
  /** Folder in the repository, e.g. `packages/data`. */
  dir: string
}

/** Component metadata plus the package it ships in (added by the generator). */
export interface CatalogComponent extends ComponentMeta {
  /** npm package that exports the component, e.g. `@advui/core`. */
  package: string
}
