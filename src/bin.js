#!/usr/bin/env node
const {createServer, defaultOptions} = require('./zora-dev-server.js');
const arg = require('arg');
const {resolve} = require('path');

(async function () {
    const argSpecs = {
        '--port': Number,
        '--config': String,
        '-c': '--config'
    };
    const {
        ['--port']: port = 3000,
        ['--config']: config
    } = arg(argSpecs, {
        permissive: false,
        argv: process.argv.slice(2)
    });

    let conf = null;
    if (config) {
        try {
            conf = require(resolve(process.cwd(), config));
        } catch (e) {
            throw new Error(`could not load the config file at ${resolve(process.cwd(), config)}`);
        }
    }

    const server = createServer(conf || defaultOptions);

    server.listen(port);
})();