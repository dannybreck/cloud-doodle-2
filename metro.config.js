const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure Metro correctly resolves node_modules
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

// Enable package exports to handle modern package.json exports
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['require', 'import', 'react-native', 'browser', 'default'];

// Add TypeScript extensions to resolver
config.resolver.sourceExts.push('ts', 'tsx');

// Add support for async storage
config.resolver.alias = {
  '@react-native-async-storage/async-storage': require.resolve('@react-native-async-storage/async-storage'),
  'react-dom': 'react-dom/client',
};

module.exports = config;