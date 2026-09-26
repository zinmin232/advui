import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Workspace packages ship TypeScript source; react-native-web ships untranspiled ESM.
  transpilePackages: [
    '@adv-ui/core',
    '@adv-ui/theme',
    '@adv-ui/icons',
    '@adv-ui/utils',
    '@adv-ui/examples',
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
