import { library, packageBoundaries } from '@advui/eslint-config'

// Data builds on core; charts build on data, so data may not import them.
export default [...library, packageBoundaries(['@advui/charts', '@advui/editor', '@advui/catalog'])]
