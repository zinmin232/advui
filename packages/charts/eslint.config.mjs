import { library, packageBoundaries } from '@advui/eslint-config'

// Charts build on core (and data for the table view); they may not import the editor.
export default [...library, packageBoundaries(['@advui/editor', '@advui/catalog'])]
