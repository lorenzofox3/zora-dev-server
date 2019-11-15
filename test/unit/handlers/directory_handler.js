import {fileHandler} from '../../../src/handlers/directory_handler.js';

export default t => {
    t.test(``, async t => {
        t.eq(fileHandler('./src').type, 'text/html; charset=utf-8');
    });
}