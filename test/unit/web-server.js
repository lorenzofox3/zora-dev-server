import {allowedMethod, errorHandler, logger} from '../../src/web-server.js';
import {app as factory} from '../../src/http.js';
import createError from 'http-errors';
import request from 'supertest';

let port = 4000;

export default t => {
    t.test(`logger middleware should log method, status, path and execution time`, async t => {
        const buffer = [];
        const fakeLogger = (args) => {
            buffer.push(args);
        };
        const app = factory()
            .use(logger(fakeLogger))
            .use(async (req, res, next) => {
                res.statusCode = 304;
            });

        const server = await app.listen(port++);
        await request(server)
            .get('/foo')
            .expect(304);

        t.eq(buffer[0].replace(/(\d+)ms/, `{TIME}ms`), 'GET - 304 - /foo - {TIME}ms');
        app.stop();
    });

    t.test('error middleware should set the status of the error if any', async t => {
        const buffer = [];
        const fakeLogger = (args) => {
            buffer.push(args);
        };
        const app = factory()
            .use(errorHandler(fakeLogger))
            .use(async (req, res, next) => {
                throw createError(403, 'You do not have access rights');
            });

        const server = await app.listen(port++);
        const res = await request(server)
            .get('/foo')
            .expect(403);

        t.eq(res.text, 'You do not have access rights');
        t.eq(buffer[0], {message: 'You do not have access rights'}, 'should log the error');
        app.stop();
    });

    t.test('error middleware should default to Internal server Error', async t => {
        const buffer = [];
        const fakeLogger = (args) => {
            buffer.push(args);
        };
        const error = new Error('oops something went wrong');
        const app = factory()
            .use(errorHandler(fakeLogger))
            .use(async (req, res, next) => {
                throw error;
            });

        const server = await app.listen(port++);
        const res = await request(server)
            .get('/foo')
            .expect(500);

        t.eq(res.text, 'oops something went wrong');
        t.is(buffer[0], error, 'should log the error');
        app.stop();
    });

    t.test('allowedMethod middleware should accept GET request', async t => {
        const app = factory()
            .use(allowedMethod())
            .use(async (req, res, next) => {
                res.body = 'hello world';
            });

        const server = await app.listen(port++);
        const res = await request(server)
            .get('/foo')
            .expect(200);

        t.eq(res.text, 'hello world');
        app.stop();
    });

    t.test(`allowedMethod middleware should prevent non GET request`, async t => {
        const app = factory()
            .use(errorHandler(() => {
            }))
            .use(allowedMethod())
            .use(async (req, res, next) => {
                res.body = 'hello world';
            });

        const server = await app.listen(port++);
        await request(server)
            .head('/foo')
            .expect(405);

        await request(server)
            .post('/foo')
            .expect(405);

        await request(server)
            .put('/foo')
            .expect(405);

        await request(server)
            .delete('/foo')
            .expect(405);

        await request(server)
            .options('/foo')
            .expect(405);

        app.stop();
    });
};