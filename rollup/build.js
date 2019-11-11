export default {
    input: './src/index.js',
    output: [{
        file: './dist/bundles/zora-dev-server.js',
        format: 'cjs'
    }, {
        file: './dist/bundles/module.js',
        format: 'esm'
    }, {
        file: './dist/bundles/zora-dev-server.mjs',
        format: 'esm'
    }]
};