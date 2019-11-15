import {promisify} from 'util';
import {createReadStream, stat as fStat} from 'fs';
import {extname} from 'path';
import {contentType} from 'mime-types';

const stat = promisify(fStat);

export const Proto = {
    async etag() {
        const fileStat = await stat(this.path);
        return String(new Date(fileStat.mtime).getTime());
    },
    async setCacheHeaders(res) {
        // node modules files are likely dependencies which should not change: we can cache them more aggressively
        const cacheControl = this.path.includes('node_modules') ?
            'public, max-age=86400' :
            'public, must-revalidate';

        res.setHeader('Cache-Control', cacheControl);
        res.etag = await this.etag();
    },
    body() {
        return createReadStream(this.path);
    }
};

export const fileHandler = (path, options) => {
    return Object.create(Proto, {
        type: {
            enumerable: true,
            value: contentType(extname(path))
        },
        path: {
            value: path
        }
    });
};