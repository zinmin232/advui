// Expo configures Metro for pnpm monorepos automatically (watch folders,
// node_modules lookup, package exports). Keep this file minimal.
const { getDefaultConfig } = require('expo/metro-config')

module.exports = getDefaultConfig(__dirname)
