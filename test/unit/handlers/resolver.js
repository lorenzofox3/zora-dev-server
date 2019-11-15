import {createFileHandler} from '../../../src/handlers/index.js';
import {Proto as JS} from '../../../src/handlers/js_file.js';

export default t => {
    t.test(`javascript file should return a js handler file`, t => {
        t.eq(Object.getPrototypeOf(createFileHandler('foo.js')), JS, '.js');
        t.eq(Object.getPrototypeOf(createFileHandler('foo.mjs')), JS, '.mjs');
    });
};