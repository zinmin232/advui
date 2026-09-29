import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Components are tested through react-native-web in jsdom — the same code path
// Next.js uses. Native rendering is verified in the Expo app (see TESTING in CONTRIBUTING.md).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { 'react-native': 'react-native-web' },
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.mjs', '.js', '.jsx', '.json'],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['src/**/*.native.test.tsx', 'node_modules/**'],
    pool: 'threads',
    fsModuleCache: true,
    server: { deps: { inline: [/tamagui/, /@tamagui/, /react-native-web/] } },
  },
})
