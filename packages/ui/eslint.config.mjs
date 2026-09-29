import { library, packageBoundaries } from '@advui/eslint-config'

// Core is the base layer: it may not import the packages built on it.
export default [
  ...library,
  packageBoundaries(['@advui/data', '@advui/charts', '@advui/editor', '@advui/catalog']),
]
