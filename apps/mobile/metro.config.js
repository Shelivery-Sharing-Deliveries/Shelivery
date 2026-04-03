const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

// SVG support: treat .svg files as source (transformed by react-native-svg-transformer)
// rather than as static assets (which would make them opaque blobs on iOS).
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...resolver,
  // Remove svg from assets so Metro doesn't serve it as a raw file
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  // Add svg to sources so Metro transforms it through react-native-svg-transformer
  sourceExts: [...resolver.sourceExts, 'svg'],
};

module.exports = config;
