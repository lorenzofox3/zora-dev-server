const path = require('path');

const memoize = (fn, map = new Map()) => {
    return function memoized(arg) {
        if (map.has(arg)) {
            return map.get(arg);
        }

        map.set(arg, fn(arg));
        return memoized(arg);
    };
};

const resolve = exports.resolve = packageId => {
    const packageJSONPath = require.resolve(`${packageId}/package.json`);
    const packageRootPath = path.dirname(packageJSONPath);
    const pkgInfo = require(packageJSONPath);
    const modulePath = pkgInfo.module || pkgInfo.main;
    const moduleFullPath = path.resolve(packageRootPath, modulePath);
    return '/' + path.relative(process.cwd(), moduleFullPath);
};

const resolver = exports.resolver = (map = new Map()) => memoize(resolve, map);
