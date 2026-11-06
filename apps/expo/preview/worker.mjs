// The phone preview's update server, a Cloudflare Worker. Files come from
// `dist-preview` without running this code; it answers only for the project's
// address, where Expo Go asks for a manifest. Expo Go refuses one without the
// `expo-protocol-version` header, which is why GitHub Pages cannot serve it.
const platforms = ['android', 'ios']

export default {
  async fetch(request, env) {
    const { origin, pathname } = new URL(request.url)
    if (pathname !== '/') return new Response('Not found', { status: 404 })

    const platform = request.headers.get('expo-platform')
    if (!platforms.includes(platform)) {
      return new Response('Open this address in Expo Go.', { status: 400 })
    }

    const stored = await env.ASSETS.fetch(new URL(`/${platform}.json`, origin))
    const manifest = await stored.json()
    const absolute = (asset) => ({ ...asset, url: new URL(asset.url, origin).href })

    return new Response(
      JSON.stringify({
        ...manifest,
        launchAsset: absolute(manifest.launchAsset),
        assets: manifest.assets.map(absolute),
      }),
      {
        headers: {
          'cache-control': 'private, max-age=0',
          'content-type': 'application/json',
          'expo-protocol-version': '1',
          'expo-sfv-version': '0',
        },
      },
    )
  },
}
