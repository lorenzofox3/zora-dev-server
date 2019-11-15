import {fileHandler as rawFileHandler} from '../../../src/handlers/raw_file.js';
import {promisify} from 'util';
import {createReadStream, stat as statCallback} from 'fs';

const stat = promisify(statCallback);

class FakeResponse {
    constructor() {
        this.headers = new Map();
        this._etag = null;
    }

    get etag() {
        return this._etag;
    }

    set etag(val) {
        this._etag = val;
    }

    setHeader(key, val) {
        this.headers.set(key, val);
    }

}

const collectStreamData = stream => new Promise((resolve, reject) => {
    let buffer = '';

    stream.on('data', d => {
        buffer += d.toString();
    });

    stream.on('error', e => {
        reject(e);
    });

    stream.on('end', () => {
        resolve(buffer);
    });
});

export default t => {

    t.test(`type should match mime type`, async t => {
        t.eq(rawFileHandler('./src/index.js').type, 'application/javascript; charset=utf-8', 'js');
        t.eq(rawFileHandler('./README.md').type, 'text/markdown; charset=utf-8', 'markdown');
        t.eq(rawFileHandler('./src/public/style.css').type, 'text/css; charset=utf-8', 'css');
    });

    t.test(`body should exactly match file content`, async t => {
        const path = './src/index.js';
        const handler = rawFileHandler(path);
        const content = await collectStreamData(handler.body());
        const expected = await collectStreamData(createReadStream(path));

        t.eq(content, expected);
    });

    t.test(`etag should match las modified file stat`, async t => {
        const path = './src/index.js';
        const handler = rawFileHandler(path);
        const etag = await handler.etag();
        const mtime = (await stat(path)).mtime;
        const expected = String(new Date(mtime).getTime());

        t.eq(etag, expected);
    });

    t.test(`setCacheHeaders should set etag and cache control policy`, async t => {
        const path = './src/index.js';
        const handler = rawFileHandler(path);
        const mtime = (await stat(path)).mtime;
        const expectedEtag = String(new Date(mtime).getTime());
        const response = new FakeResponse();

        await handler.setCacheHeaders(response);

        t.eq(response.etag, expectedEtag);
        t.eq(response.headers.get('Cache-Control'), 'public, must-revalidate');
    });

    t.test(`cache control should be more aggressive for a file in node_modules`, async t => {
        const path = './node_modules/zora/dist/bundle/module.js';
        const handler = rawFileHandler(path);
        const mtime = (await stat(path)).mtime;
        const expectedEtag = String(new Date(mtime).getTime());
        const response = new FakeResponse();

        await handler.setCacheHeaders(response);

        t.eq(response.etag, expectedEtag);
        t.eq(response.headers.get('Cache-Control'), 'public, max-age=86400');
    });
}