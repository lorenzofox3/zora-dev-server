import {from} from '../../../src/lib/stream.js';
import {Readable} from 'stream';

const collectChunk = async function (source) {
    const chunks = [];
    for await (const ch of source) {
        chunks.push(ch);
    }
    return chunks;
};

export default t => {
    t.test(`from stream`, async t => {
        t.eq(await collectChunk(from(Readable.from((async function* () {
            yield 'foo';
            yield 'bar';
        })()))), ['foo', 'bar']);
    });

    t.test(`from string`, async t => {
        t.eq(await collectChunk(from('hello world')), ['hello world']);
    });

    t.test(`from async iterator`, async t => {
        const iterable = async function* () {
            yield 'hello';
            yield 'world';
        };

        t.eq(await collectChunk(from(iterable())), ['hello', 'world']);
    });

    t.test(`from object`, async t => {
        t.eq(await collectChunk(from({hello: 'world'})), [
            `{"hello":"world"}`
        ]);
    });

    t.test(`from Promise`, async t => {
        const result = await collectChunk(from(new Promise(resolve => setTimeout(() => {
            resolve('hello world');
        }, 100))));
        t.eq(result, ['hello world']);
    });
};