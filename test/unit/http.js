import {app as factory} from '../../src/http.js';
import {Readable} from 'stream';
import request from 'supertest';

let port = 3100;

export default t => {
    t.test('register simple middleware', async t => {
        const app = factory()
            .use(async (req, res, next) => {
                res.body = 'hello world';
                await next();
            });

        const server = await app.listen(port++);
        const res = await request(server)
            .get('/')
            .expect(200);

        t.eq(res.text, 'hello world');
        app.stop();
    });

    t.test('register a stack of middleware', async t => {
        const app = factory()
            .use(async (req, res, next) => {
                await next();
                res.body = `hello ${res.foo}`;
            })
            .use(async (req, res, next) => {
                res.foo = 'world';
            });

        const server = await app.listen(port++);
        const res = await request(server)
            .get('/')
            .expect(200);

        t.eq(res.text, 'hello world');
        app.stop();
    });

    t.test(`body setter should work with string`, async t => {
        const app = factory()
            .use(async (req, res, next) => {
                res.body = `hello world`;
            });

        const server = await app.listen(port++);
        const res = await request(server)
            .get('/')
            .expect(200);

        t.eq(res.text, 'hello world');
        app.stop();
    });

    t.test(`body setter should work with async iterators`, async t => {
        const app = factory()
            .use(async (req, res, next) => {
                res.body = (async function* () {
                    yield 'hello world';
                })();
            });

        const server = await app.listen(port++);
        const res = await request(server)
            .get('/')
            .expect(200);

        t.eq(res.text, 'hello world');
        app.stop();
    });

    t.test(`body setter should work with readable stream`, async t => {
        const app = factory()
            .use(async (req, res, next) => {
                res.body = Readable.from((async function* () {
                    yield 'hello world';
                })());
            });

        const server = await app.listen(port++);
        const res = await request(server)
            .get('/')
            .expect(200);

        t.eq(res.text, 'hello world');
        app.stop();
    });

    t.test(`body setter should work with Promise`, async t => {
        const app = factory()
            .use(async (req, res, next) => {
                res.body = Promise.resolve(`hello world`);
            });

        const server = await app.listen(port++);
        const res = await request(server)
            .get('/')
            .expect(200);

        t.eq(res.text, 'hello world');
        app.stop();
    });

    t.test('body setter should set 500 status if application throws', async t => {
        const app = factory()
            .use(async (req, res, next) => {
                res.body = Promise.reject('error');
            });

        const server = await app.listen(port++);
        const res = await request(server)
            .get('/')
            .expect(500);

        t.eq(res.text, 'Internal Server Error');
        app.stop();
    });

    t.test('body setter should set 404 status if application throws an error with an "ENOENT" code', async t => {
        const app = factory()
            .use(async (req, res, next) => {
                res.body = Promise.reject({
                    code: 'ENOENT'
                });
            });

        const server = await app.listen(port++);
        const res = await request(server)
            .get('/')
            .expect(404);

        t.eq(res.text, 'Not Found');
        app.stop();
    });
}