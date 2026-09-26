// Native (iOS/Android code path) tests: jest-expo + React Native Testing Library.
// Web behaviour is covered by Vitest (vitest.config.mts); these tests make sure the
// same components render and behave through react-native + Tamagui's native build.
const allow = [
  '(jest-)?react-native',
  '@react-native(-community)?[+/]?',
  'expo(nent)?',
  '@expo(nent)?[+/].*',
  'expo-.*',
  'tamagui',
  '@tamagui[+/].*',
  'react-native-svg',
  '@advui[+/].*',
].join('|')

module.exports = {
  preset: 'jest-expo/ios',
  testMatch: ['<rootDir>/src/**/*.native.test.tsx'],
  // pnpm nests packages under node_modules/.pnpm/<name>@<version>/node_modules/<name>
  // and encodes scopes as @scope+name inside .pnpm
  transformIgnorePatterns: [`node_modules/(?!(?:\\.pnpm/)?(${allow}))`],
  testTimeout: 30000,
}
