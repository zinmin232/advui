import { createHash } from 'node:crypto'
import { basename } from 'node:path'

const contentTypes = {
  gif: 'image/gif',
  jpg: 'image/jpeg',
  otf: 'font/otf',
  png: 'image/png',
  ttf: 'font/ttf',
  webp: 'image/webp',
}

const sha256 = (data, encoding) => createHash('sha256').update(data).digest(encoding)

/** The same bundle gets the same id, so Expo Go downloads nothing it already has. */
export function updateId(bundle) {
  const hash = sha256(bundle, 'hex')
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join('-')
}

const urlPath = (path) => path.replaceAll('\\', '/')

/**
 * One platform's manifest in the Expo Updates protocol
 * (https://docs.expo.dev/technical-specs/expo-updates-1/). Its URLs are paths:
 * the Worker adds the address it was reached at.
 *
 * @param {object} options
 * @param {{ bundle: string, assets: { path: string, ext: string }[] }} options.files
 *   a platform's entry in the `metadata.json` of `expo export`
 * @param {(path: string) => Buffer} options.read reads an exported file
 * @param {Record<string, unknown>} options.config public app config (`expo config`)
 * @param {string} options.createdAt
 */
export function createManifest({ files, read, config, createdAt }) {
  const bundle = read(files.bundle)
  return {
    id: updateId(bundle),
    createdAt,
    // Expo Go compares this with its own SDK.
    runtimeVersion: `exposdk:${config.sdkVersion}`,
    launchAsset: {
      key: 'bundle',
      hash: sha256(bundle, 'base64url'),
      contentType: 'application/javascript',
      url: urlPath(files.bundle),
    },
    assets: files.assets.map(({ path, ext }) => ({
      // `expo export` names a file by the MD5 the bundle looks it up by.
      key: basename(urlPath(path)),
      hash: sha256(read(path), 'base64url'),
      contentType: contentTypes[ext] ?? 'application/octet-stream',
      fileExtension: `.${ext}`,
      url: urlPath(path),
    })),
    metadata: {},
    extra: {
      expoClient: config,
      // No Expo project stands behind this update, so it gets Expo Go's
      // anonymous scope, as a project from `expo start` without an account does.
      scopeKey: `@anonymous/${config.slug}`,
    },
  }
}
