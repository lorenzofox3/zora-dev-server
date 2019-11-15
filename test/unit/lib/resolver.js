import {resolve, resolver} from '../../../src/lib/module_resolver.js';

export default t => {
    t.test(`resolve package with a "module" filed`, t => {
        const zora = resolve('zora');
        t.eq(zora, '/node_modules/zora/dist/bundle/module.js');
    });

    t.test(`resolve directory with index file with mjs file in priority`, t => {
        const zora = resolve('zora/dist/bundle');
        t.eq(zora, '/node_modules/zora/dist/bundle/index.mjs');
    });

    t.test(`resolve to main if nothing else match`, t => {
        const r = resolve('resolve');
        t.eq(r, '/node_modules/resolve/index.js');
    });

    t.test(`if a resolve map is provided, it should overwrite the mechanism`, t => {
        const resolve = resolver(new Map([['zora', 'foo.js']]));
        t.eq(resolve('zora'), 'foo.js');
    });
}