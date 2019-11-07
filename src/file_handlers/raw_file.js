import {promisify} from 'util';
import {createReadStream, stat as fsStat} from 'fs';
import {extname} from 'path';

const stat = promisify(fsStat);

const getType = path => {
    switch (extname(path)) {
        case '.js':
        case '.mjs':
            return 'application/javascript';
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.json':
            return 'application/json';
        default:
            throw new Error({
                code: 'ENOENT' // todo proper http errors
            });
    }
};

export const Proto = {
    stats() {
        return stat(this.path);
    },
    body() {
        return createReadStream(this.path);
    }
};

export const fileHandler = (path, options) => {
    return Object.create(Proto, {
        type: {
            enumerable: true,
            value: `${getType(path)}; charset=utf8`
        },
        path: {
            value: path
        }
    });
};