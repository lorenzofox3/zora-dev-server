import {ok} from 'assert';
import {parse as parseURL} from 'url';
import {createServer, IncomingMessage, ServerResponse} from 'http';
import {from} from './lib/stream.js';
import {contentType} from 'mime-types';
import {error, log} from './lib/logger.js';

const noop = Object.freeze(() => {
});

export class Request extends IncomingMessage {
    constructor(...args) {
        super(...args);
    }

    get path() {
        // todo memoize parse
        return parseURL(this.url).pathname;
    }

    get query() {
        // todo memoize parse
        return parseURL(this.url, true).query;
    }

    get etag() {
        return this.headers['if-none-match'] || null;
    }
}

export class Response extends ServerResponse {
    constructor(...args) {
        super(...args);
    }

    get type() {
        super.getHeader('Content-Type');
    }

    set type(val) {
        super.setHeader('Content-Type', val);
    }

    get body() {
        return this._body;
    }

    set body(val) {
        const stream = from(val).on('error', err => {
            error(err);
            this.type = contentType('text/html');
            if (err.code === 'ENOENT') {
                this.statusCode = 404;
                this.end('Not Found');
            } else {
                this.statusCode = 500;
                this.end('Internal Server Error');
            }
            stream.destroy();
        });
        this._body = stream;
    }

    get etag() {
        return super.getHeader('Etag');
    }

    set etag(val) {
        super.setHeader('Etag', val);
    }
}

export const compose = (stack = []) => {
    ok(stack.length >= 1, 'you should pass at least one middleware to the stack');
    const current = stack.shift();
    const next = stack[0] !== undefined ? compose(stack) : noop;
    return async (req, res) => current(req, res, () => next(req, res));
};

export const app = () => {
    const middlewareStack = [];
    let server;
    return {
        use(fn) {
            middlewareStack.push(fn);
            return this;
        },
        callback() {
            const middlewareFn = compose([...middlewareStack]);
            return async (req, res) => {
                await middlewareFn(req, res);
                if (res.body && res.headersSent === false) {
                    res.statusCode = res.statusCode || 200;
                    res.body.pipe(res);
                } else {
                    res.end();
                }
            };
        },
        listen(port = 3000) {
            return new Promise((resolve, reject) => {
                server = createServer({
                    ServerResponse: Response,
                    IncomingMessage: Request
                }, this.callback())
                    .listen(port, err => {
                        if (err) {
                            reject(err);
                        }

                        log(`listening on port ${port}`);

                        resolve(server);
                    });
            });
        },

        stop() {
            return new Promise((resolve, reject) => server.close(err => {
                if (err) {
                    reject(err);
                }

                resolve();
            }));
        }
    };
};