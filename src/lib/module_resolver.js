import {dirname, relative, resolve as pathResolve} from 'path';

const memoize = (fn, map = new Map()) => {
    return function memoized(arg) {
        if (map.has(arg)) {
            return map.get(arg);
        }

        map.set(arg, fn(arg));
        return memoized(arg);
    };
};

export const resolve = packageId => {
    const packageJSONPath = require.resolve(`${packageId}/package.json`);
    const packageRootPath = dirname(packageJSONPath);
    const pkgInfo = require(packageJSONPath);
    const modulePath = pkgInfo.module || pkgInfo.main;
    const moduleFullPath = pathResolve(packageRootPath, modulePath);
    return '/' + relative(process.cwd(), moduleFullPath);
};

export const resolver = (map = new Map()) => memoize(resolve, map);
