import {Proto as RawPrototype} from './raw_file.js';
import {contentType} from 'mime-types';
import {promisify} from 'util';
import {readdir as readdirCallback, statSync} from 'fs';
import {extname, resolve} from 'path';

const readdir = promisify(readdirCallback);
// todo maybe we could read a .gitignore
const UNLIST = ['.DS_Store', '.git', '.idea'];

export const extensionToIcon = (file, root = process.cwd()) => {
    switch (extname(file)) {
        case '.js':
        case '.mjs':
        case '.ts':
            return '/_zora/media/git.svg';
        case '':
            const stat = statSync(resolve(root, file));
            return stat.isDirectory() ? '/_zora/media/folder-open.svg' : '/_zora/media/file-text.svg';
        default:
            return '/_zora/media/file-text.svg';
    }
};

const createLink = (file, root) => `
<li>
    <img src="${extensionToIcon(file, root)}" alt="file extension icon"/>
    <a href="${file}">${file}</a>
    ${extname(file) === '.js' ? `<a href="${file.replace(/\.js$/, '.test')}">(test?)</a>` : ''}
</li>
`;

export const html = async path => {
    const files = (await readdir(path))
        .filter(f => !UNLIST.includes(f));
    const [current, ...rest] = path.split('/')
        .filter(f => f !== undefined && f !== '.')
        .reverse();

    const links = [...rest, 'CWD'].map((part, index) => `<a href="${'../'.repeat(index + 1)}">${part}</a>`)
        .reverse()
        .concat(`<a href="./">${current}</a>`);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <base href="${path === './' ? '/' : '/' + path + '/'}">
    <title>${path === './' ? 'CWD' : path}/</title>
    <link rel="stylesheet" href="/_zora/style.css"/>
    <link href="/_zora/media/favicon.ico" rel="icon">
</head>
<body>
<style>ul{list-style: none; padding: 1em}li{padding: 0.2em; display: flex; align-items: center}li > img {padding: 0.2em 0.8em;}a{margin:0 0.2em;}</style>
<nav id="breadcrumb">
${links.join('<span role="separator">/</span>')}
<span role="separator"> | </span>
<a href="/test.glob?pattern=${path + '/**/*.js'}">Run all as tests</a>
</nav>
<ul>
${files.map(f => createLink(f, path)).join('')}
</ul>
</body>
</html>`;
};

export const Proto = Object.assign({}, RawPrototype, {
    body() {
        return html(this.path);
    }
});

export const fileHandler = (path, options) => {
    return Object.create(Proto, {
        type: {
            enumerable: true,
            value: contentType('text/html')
        },
        path: {
            value: path
        },
        options: {
            value: options
        }
    });
};