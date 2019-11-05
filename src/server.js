const {promisify} = require('util');
const {extname, resolve} = require('path');
const {stat: fsStat, createReadStream} = require('fs');

const {app: appFactory} = require('./http.js');
const testFile = require('./test_file.js');

const stat = promisify(fsStat);
const INTERNAL_PATH = '_zora';

// todo maybe prevent the access to anything above a root directory ?
// not very important for local dev server but if one wants to expose like in a staging environment, etc

const resolvePath = (rel, root = process.cwd()) => {
    const path = rel.startsWith('/') ? rel.slice(1) : rel;
    return resolve(root, path);
};

const getType = path => {
    switch (extname(path)) {
        case '.js':
        case '.mjs':
            return 'application/javascript';
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.json':
            return 'application/json';
        default:
            throw new Error('unknown type');
    }
};

const app = appFactory();

const logger = () => async (req, res, next) => {
    const start = Date.now();
    await next();
    console.log(`${req.method} - ${req.url} - ${Date.now() - start}ms`);
};

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

const errorHandler = () => async (req, res, next) => {
    try {
        await next();
    } catch (e) {
        if (e.code === 'ENOENT') {
            res.statusCode = 404;
            res.body = 'Not Found';
        } else {
            res.statusCode = 500;
            res.body = 'Internal Server Error';
        }
    }
};
const testFileHandler = () => async (req, res, next) => {
    // todo use query parameters to forward conf to test harness (reporter, etc)
    const {path} = req;
    if (extname(path) !== '.test') {
        return next();
    }
    // a test file
    res.body = testFile(path.replace(/\.test$/, '.js'));
};
const fileServerHandler = () => async (req, res) => {
    let {path} = req;
    const extension = extname(path);
    // else file server

    path = path.startsWith('/') ? path.slice(1) : path;

    if (path.startsWith(INTERNAL_PATH)) {
        path = resolvePath(path.slice(INTERNAL_PATH.length), resolve(__dirname, './public'));
    } else {
        path = resolvePath(path);
    }

    const stats = await stat(path);
    res.type = getType(path) + `; charset=utf8`;

    // todo cache
    // console.log(httpDate(stats.mtime));

    if (extension === '.js' || extension === '.mjs') {
        // todo
    } else {
    }
    res.statusCode = 200;
    res.body = createReadStream(path);
};

app
    .use(logger())
    .use(errorHandler())
    .use(testFileHandler())
    .use(fileServerHandler())
    .listen(3000);