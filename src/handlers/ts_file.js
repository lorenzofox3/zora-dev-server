import {fileHandler as rawFileHandler} from './raw_file.js';

export const fileHandler = (path, options = {}) => {
    if (options.raw) {
        return rawFileHandler(path, options = {});
    }

    throw new Error(`not implemented`);
};