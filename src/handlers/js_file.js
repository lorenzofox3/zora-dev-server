import {createReadStream} from 'fs';
import {fileHandler as rawFileHandler, Proto as RawProto} from './raw_file.js';
import {transform} from '../lib/js_transform_stream.js';
import {contentType} from 'mime-types';

export const Proto = Object.assign({}, RawProto, {
    body() {
        return transform(createReadStream(this.path), this.options.resolve);
    }
});

export const fileHandler = (path, options = {}) => {

    if (options.format && options.format === 'raw') {
        return rawFileHandler(path, options);
    }

    return Object.create(Proto, {
        type: {
            enumerable: true,
            value: contentType('.js')
        },
        path: {
            value: path
        },
        options: {
            value: options
        }
    });
};