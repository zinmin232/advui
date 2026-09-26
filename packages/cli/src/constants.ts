// Branding lives here so the project can be renamed in one place (see scripts/rename.mjs).
export const PRODUCT_NAME = 'Adv UI'
export const CLI_NAME = 'adv-ui'
export const PACKAGE_SCOPE = '@adv-ui'
export const CONFIG_FILE = 'adv-ui.json'
/** Default remote registry. Override with `--registry` or the config file. */
export const DEFAULT_REGISTRY = 'https://adv-ui.dev/r'

/** Packages every project needs, regardless of which components are added. */
export const BASE_DEPENDENCIES = [
  `${PACKAGE_SCOPE}/theme`,
  `${PACKAGE_SCOPE}/icons`,
  `${PACKAGE_SCOPE}/utils`,
  'tamagui',
]
