// Branding lives here so the project can be renamed in one place (see scripts/rename.mjs).
export const PRODUCT_NAME = 'Adv UI'
export const CLI_NAME = 'advui'
export const PACKAGE_SCOPE = '@advui'
export const CONFIG_FILE = 'advui.json'
/** Default remote registry. Override with `--registry` or the config file. */
export const DEFAULT_REGISTRY = 'https://zinmin232.github.io/advui/r'

/** Packages every project needs, regardless of which components are added. */
export const BASE_DEPENDENCIES = [
  `${PACKAGE_SCOPE}/theme`,
  `${PACKAGE_SCOPE}/icons`,
  `${PACKAGE_SCOPE}/utils`,
  'tamagui',
]
