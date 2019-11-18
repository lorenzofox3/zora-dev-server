import {fileHandler} from '../../../src/handlers/test_runner.js';
import {createHash} from 'crypto';
import glob from 'fast-glob';

export default t => {
    t.test(`type should match the mime type of an html document`, t => {
        const handler = fileHandler('whatever', {pattern: 'test/unit/*.js'});
        t.eq(handler.type, 'text/html; charset=utf-8');
    });

    t.test(`etag should be made as a hash of the file names matching the pattern`, async t => {
        const pattern = 'test/unit/*.js';
        const handler = fileHandler('whatever', {pattern});

        const files = (await glob(pattern)).join(',');
        const expected = createHash('sha256')
            .update(files)
            .digest('hex');

        t.eq(await handler.etag(), expected);
    });
}