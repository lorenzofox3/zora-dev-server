import {dirname, relative, resolve as pathResolve} from 'path';
import {memoize} from './util.js';

export const resolve = packageId => {
    const packageJSONPath = require.resolve(`${packageId}/package.json`);
    const packageRootPath = dirname(packageJSONPath);
    const pkgInfo = require(packageJSONPath);
    const modulePath = pkgInfo.module || pkgInfo.main;
    const moduleFullPath = pathResolve(packageRootPath, modulePath);
    return '/' + relative(process.cwd(), moduleFullPath);
};

export const resolver = (map = new Map()) => memoize(resolve, map);
