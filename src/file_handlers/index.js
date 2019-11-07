import {extname} from 'path';
import {fileHandler as rawFileHandler} from './raw_file.js';
import {fileHandler as jsFileHandler} from './js_file.js';
import {fileHandler as testFileHandler} from './test_file.js';

export const createFileHandler = (file, options = {}) => {
    switch (extname(file)) {
        case '.js':
        case '.mjs':
            return jsFileHandler(file, options);
        case '.ts':
            throw new Error(`File handler for typescript not implemented yet`);
        case '.test':
            return testFileHandler(file, options);
        default:
            return rawFileHandler(file, options);
    }
};