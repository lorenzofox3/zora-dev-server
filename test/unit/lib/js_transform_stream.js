import {replace, transform} from '../../../src/lib/js_transform_stream.js';

const from = async function* (string) {
    yield string;
};

const getOutput = async (stream) => {
    for await (const chunk of stream) {
        return chunk;
    }
};

export default t => {
    t.test(`replace simple inline import declaration`, t => {
        const moduleString = `'bar'`;
        const input = `import foo from ${moduleString}`;
        t.eq(replace(input, {
            start: input.indexOf(moduleString),
            span: moduleString.length,
            modulePath: './path/to/foo.js'
        }), `import foo from "./path/to/foo.js"`);
    });

    t.test(`replace with multiline import declaration`, t => {
        const moduleString = `'bar'`;
        const input = `import {
            foo
        } from ${moduleString}`;
        t.eq(replace(input, {
            start: input.indexOf(moduleString),
            span: moduleString.length,
            modulePath: './path/to/foo.js'
        }), `import {
            foo
        } from "./path/to/foo.js"`);
    });

    t.test(`replace from a source code`, t => {
        const moduleString = `'bar'`;
        const secondModuleString = `"woot_hanga"`;
        const input = `import {foo} from ${moduleString}
        import * as woot from ${secondModuleString};
        
        console.log('hello world');
        `;

        const sourcesInfo = [{
            start: input.indexOf(moduleString),
            span: moduleString.length,
            modulePath: './path/to/foo.js'
        }, {
            start: input.indexOf(secondModuleString),
            span: secondModuleString.length,
            modulePath: './path/to/woot_hanga.js'
        }];

        const output = sourcesInfo.reverse().reduce(replace, input);
        t.eq(output, `import {foo} from "./path/to/foo.js"
        import * as woot from "./path/to/woot_hanga.js";
        
        console.log('hello world');
        `);
    });

    t.test(`transform simple inline import declaration`, async t => {
        const moduleString = `'bar'`;
        const input = `import foo from ${moduleString}`;
        const output = await getOutput(transform(from(input), () => '/path/to/foo.js'));
        t.eq(output, 'import foo from "/path/to/foo.js"');
    });

    t.test(`transform simple inline export declaration`, async t => {
        const moduleString = `'bar'`;
        const input = `export {foo} from ${moduleString}`;
        const output = await getOutput(transform(from(input), () => '/path/to/foo.js'));
        t.eq(output, 'export {foo} from "/path/to/foo.js"');
    });

    t.test(`transform with multiline import declaration`, async t => {
        const moduleString = `'bar'`;
        const input = `import {
            foo
        } from ${moduleString}`;
        const output = await getOutput(transform(from(input), () => '/path/to/foo.js'));
        t.eq(output, `import {
            foo
        } from "/path/to/foo.js"`);
    });

    t.test(`transform with multiline export declaration`, async t => {
        const moduleString = `'bar'`;
        const input = `export {
            foo
        } from ${moduleString}`;
        const output = await getOutput(transform(from(input), () => '/path/to/foo.js'));
        t.eq(output, `export {
            foo
        } from "/path/to/foo.js"`);
    });

    t.test(`transform from a source code`, async t => {
        const moduleString = `'bar'`;
        const secondModuleString = `"woot_hanga"`;
        const input = `import {foo} from ${moduleString}
        import * as woot from ${secondModuleString};
        
        console.log('hello world');
        `;
        const output = await getOutput(transform(from(input), () => '/path/to/whatever.js'));
        t.eq(output, `import {foo} from "/path/to/whatever.js"
        import * as woot from "/path/to/whatever.js";
        
        console.log('hello world');
        `);
    });

    t.test(`transform mixed import & export declaration`, async t => {
        const code = `import foo from 'foo';
        export * from 'bar';
        import woot from 'woot';`;

        const output = await getOutput(transform(from(code), id => `${id}.js`));
        t.eq(output, `import foo from "foo.js";
        export * from "bar.js";
        import woot from "woot.js";`);
    });

    t.test(`do not transform an export declaration if it does not refer to a source`, async t => {
        const input = `export const foo = 'bar'`;
        const output = await getOutput(transform(from(input), () => '/path/to/whatever.js'));
        t.eq(output, input);
    });

    t.test(`do not transform if module id is already a path`, async t => {
        const code = `import foo from 'some/path.js'`;
        const output = await getOutput(transform(from(code)));
        t.eq(output, code);
    });

    t.test(`do not transform if parsing the eventual expression fails`, async t => {
        const code = `'import' !== 'export`;
        const output = await getOutput(transform(from(code)));
        t.eq(output, code);
    });

};