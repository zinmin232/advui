import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { describe, it } from 'node:test'
import { createManifest, updateId } from './manifest.mjs'
import worker from './worker.mjs'

const files = {
  bundle: '_expo/static/js/android/entry-abc.js',
  assets: [
    { path: 'assets\\0123abcd', ext: 'png' },
    { path: 'assets/4567efab', ext: 'mp3' },
  ],
}

const manifest = () =>
  createManifest({
    files,
    read: (path) => Buffer.from(`contents of ${path}`),
    config: { slug: 'advui-playground', sdkVersion: '57.0.0' },
    createdAt: '2026-11-06T00:00:00.000Z',
  })

describe('createManifest', () => {
  it('targets the Expo SDK that Expo Go runs', () => {
    assert.equal(manifest().runtimeVersion, 'exposdk:57.0.0')
  })

  it('gives the same bundle the same UUID, and another bundle another', () => {
    assert.match(updateId('a'), /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    assert.equal(updateId('a'), updateId('a'))
    assert.notEqual(updateId('a'), updateId('b'))
  })

  it('hashes the bundle as the protocol asks: base64url SHA-256', () => {
    const { launchAsset } = manifest()
    assert.equal(launchAsset.key, 'bundle')
    assert.equal(launchAsset.url, files.bundle)
    assert.equal(
      launchAsset.hash,
      createHash('sha256').update(`contents of ${files.bundle}`).digest('base64url'),
    )
  })

  it('lists assets by the name the bundle looks them up by, with URL paths on Windows too', () => {
    const [image, other] = manifest().assets
    assert.equal(image.key, '0123abcd')
    assert.equal(image.url, 'assets/0123abcd')
    assert.equal(image.contentType, 'image/png')
    assert.equal(image.fileExtension, '.png')
    assert.equal(other.contentType, 'application/octet-stream')
  })
})

describe('worker', () => {
  const stored = {
    launchAsset: { key: 'bundle', url: '_expo/static/js/android/entry-abc.js' },
    assets: [{ key: '0123abcd', url: 'assets/0123abcd' }],
  }
  const asked = []
  const env = {
    ASSETS: {
      async fetch(url) {
        asked.push(new URL(url).pathname)
        return Response.json(stored)
      },
    },
  }
  const open = (path, headers) =>
    worker.fetch(new Request(`https://preview.test${path}`, { headers }), env)

  it('answers Expo Go with its platform and the header it requires', async () => {
    const response = await open('/', { 'expo-platform': 'ios' })
    assert.equal(response.status, 200)
    assert.equal(asked.at(-1), '/ios.json')
    assert.equal(response.headers.get('expo-protocol-version'), '1')
    assert.equal(response.headers.get('expo-sfv-version'), '0')
    assert.equal(response.headers.get('content-type'), 'application/json')
  })

  it('makes every URL absolute from the address it was reached at', async () => {
    const response = await open('/', { 'expo-platform': 'android' })
    const manifest = await response.json()
    assert.equal(
      manifest.launchAsset.url,
      'https://preview.test/_expo/static/js/android/entry-abc.js',
    )
    assert.equal(manifest.assets[0].url, 'https://preview.test/assets/0123abcd')
  })

  it('refuses anything but a known platform, as the protocol asks', async () => {
    assert.equal((await open('/', {})).status, 400)
    assert.equal((await open('/', { 'expo-platform': 'web' })).status, 400)
  })

  it('answers nothing else: files are served before it runs', async () => {
    assert.equal((await open('/missing', { 'expo-platform': 'android' })).status, 404)
  })
})
