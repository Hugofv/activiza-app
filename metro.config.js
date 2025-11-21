// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

function createConfig() {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  // SVG transformer
  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
  };

  // SVG resolver
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  return config;
}

const config = createConfig();

// Apply NativeWind on top of the SVG-enabled config
const finalConfig = withNativeWind(config, { input: "./global.css" });

// Ensure SVG transformer is preserved after NativeWind
// NativeWind might override the transformer, so we set it again
finalConfig.transformer = {
  ...finalConfig.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

module.exports = finalConfig;
