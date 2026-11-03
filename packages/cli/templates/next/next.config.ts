import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Add @advui/data, @advui/charts and @advui/editor when you use them.
  transpilePackages: [
    '@advui/core',
    '@advui/theme',
    '@advui/icons',
    '@advui/utils',
    'react-native-web',
  ],
  turbopack: {
    // Adv UI is written for React Native; on the web, React Native Web stands in for it.
    resolveAlias: { 'react-native': 'react-native-web' },
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
