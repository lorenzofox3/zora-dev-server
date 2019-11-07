import {ok} from 'assert';
import {parse} from 'url';
import {createServer, IncomingMessage, ServerResponse} from 'http';
import {Stream} from 'stream';

const noop = Object.freeze(() => {
});

export class Request extends IncomingMessage {
    constructor(...args) {
        super(...args);
    }

    get path() {
        return parse(this.url).pathname;
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

    get length() {
        super.getHeader('Content-Length');
    }

    set length(val) {
        super.setHeader('Content-Length', val);
    }

    get body() {
        return this._body;
    }

    set body(val) {
        this._body = val;
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
    return {
        use(fn) {
            middlewareStack.push(fn);
            return this;
        },
        listen(port = 3000) {
            const middlewareFn = compose([...middlewareStack]);
            const handler = async (req, res) => {
                await middlewareFn(req, res);

                if (res.body && res.headersSent === false) {
                    res.statusCode = res.statusCode || 200;

                    if (res.body instanceof Stream) {
                        res.body.pipe(res);
                    } else if (typeof res.body === 'string') {
                        res.length = Buffer.byteLength(res.body);
                        res.end(res.body);
                    }
                }
            };

            return createServer({
                ServerResponse: Response,
                IncomingMessage: Request
            }, handler).listen(port);
        }
    };
};