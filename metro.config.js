// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper platform resolution for React Native
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure AsyncStorage and other RN packages resolve to native implementations
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;