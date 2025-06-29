const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add TypeScript extensions to resolver
config.resolver.sourceExts.push('ts', 'tsx');

// Add support for async storage
config.resolver.alias = {
  '@react-native-async-storage/async-storage': require.resolve('@react-native-async-storage/async-storage'),
  'react-dom': 'react-dom/client',
};

module.exports = config;