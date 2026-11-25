const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// bwip-js's React Native build imports react-zlib-js (for PNG output), which crashes
// Hermes as soon as it loads. The app only calls toSVG, so native bundles use the
// platform-neutral build instead. Web and Node (tests) keep the default entry.
const BWIP_GENERIC = path.join(
  __dirname,
  "node_modules/bwip-js/dist/bwip-js-gen.mjs",
);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "bwip-js" && (platform === "android" || platform === "ios")) {
    return { type: "sourceFile", filePath: BWIP_GENERIC };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
