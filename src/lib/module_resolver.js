import {relative} from 'path';
import {memoize} from './util.js';
import * as r from 'resolve';

export const resolve = packageId => {
    const moduleFullPath = r.sync(packageId, {
        packageFilter: (pkg) => {
            if (pkg.module) {
                pkg.main = pkg.module;
            }
            return pkg;
        },
        extensions: ['.mjs', '.js']
    });
    return '/' + relative(process.cwd(), moduleFullPath);
};

export const resolver = (map = new Map()) => memoize(resolve, map);
