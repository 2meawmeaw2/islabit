const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Apply NativeWind configuration
  const configWithNativeWind = withNativeWind(config, {
    input: "./app/globals.css",
  });

  // Apply SVG transformer configuration
  const { transformer, resolver } = configWithNativeWind;

  configWithNativeWind.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
  };

  configWithNativeWind.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  return configWithNativeWind;
})();
