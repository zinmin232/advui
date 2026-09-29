// Only used by the native Jest suite (jest-expo). Library builds use tsc.
module.exports = function (api) {
  api.cache(true)
  return { presets: ['babel-preset-expo'] }
}
