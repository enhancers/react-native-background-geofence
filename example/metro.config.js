const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('@react-native/metro-config');
const { getConfig } = require('react-native-builder-bob/metro-config');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');

// Peer dependencies that must resolve to a single instance (from example/node_modules)
const peerDeps = Object.keys(pkg.peerDependencies || {});

// Build a map of peer dep real paths (following pnpm symlinks) so we can
// deduplicate them even when Metro resolves .pnpm virtual store paths.
const exampleNodeModules = path.join(__dirname, 'node_modules');
const peerDepRealPaths = {};
for (const dep of peerDeps) {
  const symlink = path.join(exampleNodeModules, dep);
  try {
    peerDepRealPaths[dep] = fs.realpathSync(symlink);
  } catch {
    peerDepRealPaths[dep] = symlink;
  }
}

const bobConfig = getConfig(getDefaultConfig(__dirname), {
  root,
  pkg,
  project: __dirname,
});

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = {
  ...bobConfig,
  resolver: {
    ...bobConfig.resolver,
    // Force peer dependencies to resolve to example/node_modules even when
    // Metro follows pnpm symlinks into the .pnpm virtual store.
    resolveRequest: (context, moduleName, platform) => {
      if (peerDeps.includes(moduleName)) {
        return {
          filePath: peerDepRealPaths[moduleName]
            ? require.resolve(moduleName, { paths: [exampleNodeModules] })
            : path.join(exampleNodeModules, moduleName),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};
