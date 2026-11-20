/**
 * Compatibility shim for Jest 26 (bundled with Razzle 4):
 * maps `node:*` built-in specifiers used by modern dependencies to standard Node.js built-ins.
 */
const { builtinModules } = require('module');

for (const modName of builtinModules) {
    if (!modName.startsWith('node:') && !modName.startsWith('_')) {
        jest.mock(`node:${modName}`, () => jest.requireActual(modName), { virtual: true });
    }
}
