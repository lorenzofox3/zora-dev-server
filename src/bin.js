#!/usr/bin/env node
const {createServer} = require('./zora-dev-server.js');
const arg = require('arg');

(async function () {
    const argSpecs = {
        '--port': Number
    };
    const {
        ['--port']: port = 3000
    } = arg(argSpecs, {
        permissive: false,
        argv: process.argv.slice(2)
    });

    const server = createServer();

    server.listen(port);
})();