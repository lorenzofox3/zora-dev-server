import {extname} from 'path';
import {fileHandler as rawFileHandler} from './raw_file.js';
import {fileHandler as jsFileHandler} from './js_file.js';
import {fileHandler as testFileHandler} from './test_file.js';
import {fileHandler as tsFileHandler} from './ts_file.js';
import {testRunnerHandler} from './test_runner.js';

export const createFileHandler = (file, options = {}) => {
    switch (extname(file)) {
        case '.js':
        case '.mjs':
            return jsFileHandler(file, options);
        case '.glob':
            return testRunnerHandler(file, options);
        case '.ts':
            return tsFileHandler(file, options);
        case '.test':
            return testFileHandler(file, options);
        default:
            return rawFileHandler(file, options);
    }
};