import {extname, relative, resolve} from 'path';
import {createFileHandler} from './handlers/index.js';
import {app as appFactory} from './http.js';
import {error, log} from './lib/logger.js';
import createError from 'http-errors';

const INTERNAL_PATH = '_zora';

const resolvePath = rel => {
    let path = rel.startsWith('/') ? rel.slice(1) : rel;

    if (extname(rel) === '.glob') {
        path = resolve(__dirname, './handlers/test_runner.glob');
    } else if (path.startsWith(INTERNAL_PATH)) {
        path = resolve(__dirname, 'public', path.slice(INTERNAL_PATH.length + 1));
    }

    return relative(process.cwd(), path);
};

export const createServer = () => {

    const app = appFactory();

    const logger = () => async (req, res, next) => {
        const start = Date.now();
        await next();
        log(`${req.method} - ${res.statusCode} - ${req.url} - ${Date.now() - start}ms`);
    };

    const errorHandler = () => async (req, res, next) => {
        try {
            await next();
        } catch (e) {
            error(e);
            res.statusCode = e.status || 500;
            res.body = e.message || 'Internal Server Error';
        }
    };

    const allowedMethod = () => async (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            throw createError(405);
        }
        await next();
    };

    const fileServerHandler = () => async (req, res) => {
        let {path, query} = req;
        let fileHandler;

        //todo
        if (path.includes('favicon.ico')) {
            path = '/_zora/favicon.ico';
        }

        const actualPath = resolvePath(path);
        fileHandler = createFileHandler(actualPath, query);

        res.type = fileHandler.type;

        await fileHandler.setCacheHeaders(res);

        if (req.etag && req.etag === res.etag && !(req.headers['cache-control'] || '').includes('no-cache')) {
            res.statusCode = 304;
            return;
        }

        res.body = fileHandler.body();
    };

    return app
        .use(logger())
        .use(errorHandler())
        .use(allowedMethod())
        .use(fileServerHandler());
};

