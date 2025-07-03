module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // This is unchanged.
    plugins: [
      // --- THIS IS THE CRITICAL ADDITION ---
      [
        'module-resolver', // The plugin that understands path aliases.
        {
          alias: {
            '@': './', // The rule that mirrors tsconfig.json.
          },
        },
      ],
      // --- THIS IS PRESERVED ---
      'nativewind/babel', // We keep the existing NativeWind plugin.
    ],
  };
};