import type { NextConfig } from 'next'

// GitHub Pages build: `STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/advui next build`
// writes a static site to `out/`, served from https://<user>.github.io/advui/.
const staticExport = process.env.STATIC_EXPORT === '1'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath,
  // Folder-style URLs (`/docs/button/index.html`) work on every static host.
  ...(staticExport ? { output: 'export' as const, trailingSlash: true } : {}),
  // Workspace packages ship TypeScript source; react-native-web ships untranspiled ESM.
  transpilePackages: [
    '@advui/catalog',
    '@advui/charts',
    '@advui/core',
    '@advui/data',
    '@advui/editor',
    '@advui/theme',
    '@advui/icons',
    '@advui/utils',
    '@advui/examples',
    'react-native-web',
  ],
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
    },
    resolveExtensions: [
      '.web.tsx',
      '.web.ts',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.mjs',
      '.json',
    ],
  },
}

export default nextConfig
