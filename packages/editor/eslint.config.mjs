import { library, packageBoundaries } from '@advui/eslint-config'

// The editor builds on core only; it may not import data or charts.
export default [...library, packageBoundaries(['@advui/data', '@advui/charts', '@advui/catalog'])]
