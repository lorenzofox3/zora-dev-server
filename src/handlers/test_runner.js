import glob from 'fast-glob';
import {Proto as RawProto} from './raw_file.js';
import {html} from './test_file.js';
import {contentType} from 'mime-types';
import {createHash} from 'crypto';

const DEFAULT_PATTERN = ['test/**/*.js'];

/**
 * this handler allow to run multiple test files at once
 **/

const Proto = Object.assign({}, RawProto, {
    async body() {
        const files = (await glob(this.globPattern));
        return html(this.globPattern, files);
    },
    async etag() {
        //todo we can cache files (see body method)
        const files = (await glob(this.globPattern));
        const hash = createHash('sha256');
        hash.update(files.join(','));
        return hash.digest('hex');
    }
});

export const testRunnerHandler = (path, {pattern = DEFAULT_PATTERN} = {pattern: DEFAULT_PATTERN}) => {
    const actualPath = path.replace(/\.glob$/, '.js');
    const globPattern = Array.isArray(pattern) ? pattern : [pattern];
    return Object.create(Proto, {
        type: {
            enumerable: true,
            value: contentType('text/html')
        },
        globPattern: {
            value: globPattern
        },
        path: {
            value: actualPath
        }
    });
};


