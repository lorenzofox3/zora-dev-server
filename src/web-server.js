import {resolve} from 'path';
import {createFileHandler} from './file_handlers/index.js';
import {app as appFactory} from './http.js';

const INTERNAL_PATH = '_zora';

const resolvePath = (rel, root = process.cwd()) => {
    let path = rel.startsWith('/') ? rel.slice(1) : rel;

    if (path.startsWith(INTERNAL_PATH)) {
        path = resolvePath(path.slice(INTERNAL_PATH.length), resolve(__dirname, './public'));
    } else {
        path = resolvePath(path);
    }

    return resolve(root, path);
};

const app = appFactory();

const logger = () => async (req, res, next) => {
    const start = Date.now();
    await next();
    console.log(`${req.method} - ${req.url} - ${Date.now() - start}ms`);
};

/**
 const httpDateOptions = {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h24',
    timeZone: 'GMT'
};

 const httpDate = input => new Date(input).toLocaleDateString('en-US', httpDateOptions);
 **/

const errorHandler = () => async (req, res, next) => {
    try {
        await next();
    } catch (e) {
        console.error(e);
        if (e.code === 'ENOENT') {
            res.statusCode = 404;
            res.body = 'Not Found';
        } else {
            res.statusCode = 500;
            res.body = 'Internal Server Error';
        }
    }
};

const fileServerHandler = () => async (req, res) => {
    const {path} = req;
    const actualPath = resolvePath(path);
    const fileHandler = createFileHandler(actualPath);

    // todo cache

    res.type = fileHandler.type;
    res.body = fileHandler.body();
};

app
    .use(logger())
    .use(errorHandler())
    .use(fileServerHandler())
    .listen(3000);