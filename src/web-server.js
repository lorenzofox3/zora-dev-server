import {extname, relative, resolve} from 'path';
import {createFileHandler} from './handlers/index.js';
import {app as appFactory} from './http.js';
import {resolver} from './lib/module_resolver.js';
import {error as errorLogger, log as infoLogger} from './lib/logger.js';
import createError from 'http-errors';

const INTERNAL_PATH = '_zora';

const resolvePath = rel => {

    if (rel === '/') {
        return './';
    }

    let path = rel.startsWith('/') ? rel.slice(1) : rel;

    if (extname(rel) === '.glob') {
        path = resolve(__dirname, './handlers/test_runner.glob');
    } else if (path.startsWith(INTERNAL_PATH)) {
        path = resolve(__dirname, 'public', path.slice(INTERNAL_PATH.length + 1));
    }

    return relative(process.cwd(), path);
};

export const logger = (log = infoLogger) => async (req, res, next) => {
    const start = Date.now();
    await next();
    log(`${req.method} - ${res.statusCode} - ${req.url} - ${Date.now() - start}ms`);
};

export const errorHandler = (error = errorLogger) => async (req, res, next) => {
    try {
        await next();
    } catch (e) {
        error(e);
        res.statusCode = e.status || 500;
        res.body = e.message || 'Internal Server Error';
    }
};

export const allowedMethod = () => async (req, res, next) => {
    if (req.method !== 'GET') {
        throw createError(405);
    }
    await next();
};

export const fileServerHandler = (options = {}) => async (req, res) => {
    let {path, query} = req;
    let fileHandler;

    if (path.includes('favicon.ico')) {
        path = '/_zora/media/favicon.ico';
    }

    try {
        fileHandler = createFileHandler(resolvePath(path), Object.assign({}, query, options));

        res.type = fileHandler.type;

        await fileHandler.setCacheHeaders(res);

        if (req.etag && req.etag === res.etag && !(req.headers['cache-control'] || '').includes('no-cache')) {
            res.statusCode = 304;
            return;
        }

        res.body = fileHandler.body();
    } catch (e) {
        if(e.code === 'ENOENT'){
            throw createError(404);
        }
        throw e;
    }
};

export const defaultOptions = Object.freeze({dependenciesMap: {}});

export const createServer = ({dependenciesMap = {}} = defaultOptions) => {

    const app = appFactory();
    const resolve = resolver(new Map(Object.entries(dependenciesMap)));

    return app
        .use(logger())
        .use(errorHandler())
        .use(allowedMethod())
        .use(fileServerHandler({resolve}));
};

