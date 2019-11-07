import {
    AS,
    BRACKET_CLOSE,
    BRACKET_OPEN,
    COMA,
    EXPORT,
    FROM,
    IMPORT,
    parse,
    scan,
    scanDoubleQuoteStringLiteral,
    scanIdentifier,
    scanSingleQuoteStringLiteral,
    source,
    STAR,
    tokenize
} from '../../src/lib/import_parser.js';

export default t => {
    t.test(`source stream`, t => {
        t.test(`source should be an iterableIterator`, t => {
            const src = source('foo');
            t.ok(src[Symbol.iterator]);
            t.ok(typeof src.next === 'function');
        });

        t.test(`peek should see the next nth item without advancing the stream `, t => {
            const src = source(`import`);
            t.eq(src.peek(), {done: false, value: 'i'});
            t.eq(src.peek(3), {done: false, value: 'o'});
            t.eq(src.next(), {done: false, value: 'i'});
            t.eq(src.next(), {done: false, value: 'm'});
            t.eq(src.next(), {done: false, value: 'p'});
            t.eq(src.next(), {done: false, value: 'o'});
            t.eq(src.next(), {done: false, value: 'r'});
            t.eq(src.next(), {done: false, value: 't'});
        });

        t.test(`eat should advance the stream`, t => {
            const src = source('foo bar');
            src.eat();
            t.eq(src.peek(), {done: false, value: 'o'});
            src.eat(2);
            t.eq(src.peek(), {done: false, value: ' '});
        });

        t.test(`current index should increase when the stream is advanced`, t => {
            const src = source('foo bar');
            t.eq(src.currentIndex(), 0);
            src.peek();
            t.eq(src.currentIndex(), 0);
            src.eat(2);
            t.eq(src.currentIndex(), 2);
            const srcBis = source('foo bar', 666);
            t.eq(srcBis.currentIndex(), 666, 'should take in consideration the initial offset');
            srcBis.eat(3);
            t.eq(srcBis.currentIndex(), 669, 'should take in consideration the initial offset');
        });
    });

    t.test(`scanner`, t => {
        t.test(`scan STAR`, t => {
            const src = source(`* from`);
            t.eq(scan(src), STAR);
            t.eq(src.peek(), {done: false, value: ' '}, 'should have advanced the stream');
        });

        t.test(`scan import keyword`, t => {
            const string = `import *`;
            const src = source(string);
            const srcBis = source(string);
            t.eq(scan(src), IMPORT);
            t.eq(src.peek(), {done: false, value: ' '});
            t.eq(scanIdentifier(srcBis), IMPORT);
            t.eq(srcBis.peek(), {done: false, value: ' '});
        });

        t.test(`scan as keyword`, t => {
            const string = `as `;
            const src = source(string);
            const srcBis = source(string);
            t.eq(scan(src), AS);
            t.eq(src.peek(), {done: false, value: ' '});
            t.eq(scanIdentifier(srcBis), AS);
            t.eq(srcBis.peek(), {done: false, value: ' '});
        });

        t.test(`scan from keyword`, t => {
            const string = `from `;
            const src = source(string);
            const srcBis = source(string);
            t.eq(scan(src), FROM);
            t.eq(src.peek(), {done: false, value: ' '});
            t.eq(scanIdentifier(srcBis), FROM);
            t.eq(srcBis.peek(), {done: false, value: ' '});
        });

        t.test(`scan export keyword`, t => {
            const string = `export `;
            const src = source(string);
            const srcBis = source(string);
            t.eq(scan(src), EXPORT);
            t.eq(src.peek(), {done: false, value: ' '});
            t.eq(scanIdentifier(srcBis), EXPORT);
            t.eq(srcBis.peek(), {done: false, value: ' '});
        });

        t.test(`scan identifier`, t => {
            const string = `hello `;
            const src = source(string);
            const srcBis = source(string);
            const expected = {type: 'Identifier', value: 'hello'};
            t.eq(scan(src), expected);
            t.eq(src.peek(), {done: false, value: ' '});
            t.eq(scanIdentifier(srcBis), expected);
            t.eq(srcBis.peek(), {done: false, value: ' '});
        });

        t.test(`scan should skip white spaces`, t => {
            const string = `  hello`;
            const src = source(string);
            t.eq(scan(src), {type: 'Identifier', value: 'hello'});
        });

        t.test(`scan punctuation`, t => {
            const openBracket = source('{ ');
            const closeBracket = source('} ');
            const coma = source(', ');
            t.eq(scan(openBracket), BRACKET_OPEN);
            t.eq(openBracket.peek(), {done: false, value: ' '});
            t.eq(scan(closeBracket), BRACKET_CLOSE);
            t.eq(closeBracket.peek(), {done: false, value: ' '});
            t.eq(scan(coma), COMA);
            t.eq(coma.peek(), {done: false, value: ' '});
        });

        t.test(`scan single quote string literal`, t => {
            const string = `'hello' `;
            const src = source(string);
            const srcBis = source(string);
            t.eq(scan(src), {type: 'Literal', value: 'hello', span: 7, start: 0});
            t.eq(src.peek(), {done: false, value: ' '});
            t.eq(scanSingleQuoteStringLiteral(srcBis), {type: 'Literal', value: 'hello', span: 7, start: 0});
            t.eq(srcBis.peek(), {done: false, value: ' '});
        });

        t.test(`scan double quote string literal`, t => {
            const string = `"hello" `;
            const src = source(string);
            const srcBis = source(string);
            t.eq(scan(src), {type: 'Literal', value: 'hello', span: 7, start: 0});
            t.eq(src.peek(), {done: false, value: ' '});
            t.eq(scanDoubleQuoteStringLiteral(srcBis), {type: 'Literal', value: 'hello', span: 7, start: 0});
            t.eq(srcBis.peek(), {done: false, value: ' '});
        });

        t.skip(`scan single quote string literal with escape`, t => {
            const string = `'h\'ello' `;
            const src = source(string);
            const srcBis = source(string);
            const expected = {type: 'Literal', value: `h'ello`, span: 8, start: 0};
            t.eq(scan(src), expected);
            t.eq(src.peek(), {done: false, value: ' '});
            t.eq(scanSingleQuoteStringLiteral(srcBis), expected);
            t.eq(srcBis.peek(), {done: false, value: ' '});
        });

        t.skip(`scan double quote string literal with escape`, t => {
            const string = `"h\"ello" `;
            const src = source(string);
            const srcBis = source(string);
            const expected = {type: 'Literal', value: `h"ello`, span: 8, start: 0};
            t.eq(scan(src), expected);
            t.eq(src.peek(), {done: false, value: ' '});
            t.eq(scanDoubleQuoteStringLiteral(srcBis), expected);
            t.eq(srcBis.peek(), {done: false, value: ' '});
        });
    });

    t.test(`tokenizer`, async t => {
        const consume = async stream => {
            const items = [];
            for await (const i of stream) {
                items.push(i);
            }
            return items;
        };
        t.eq(await consume(tokenize(`import {foo as bar} from 'woot.js'`)), [
            IMPORT,
            BRACKET_OPEN,
            {type: 'Identifier', value: 'foo'},
            AS,
            {type: 'Identifier', value: 'bar'},
            BRACKET_CLOSE,
            FROM,
            {type: 'Literal', value: 'woot.js', span: 9, start: 25}
        ]);
    });

    t.test(`import parser`, t => {
        t.test(`parse import with string literal module specifier`, t => {
            const code = `import './foo.js';`;
            const code2 = `import "bar.js"`;

            t.eq(parse(code), {
                type: 'ImportDeclaration',
                specifiers: [],
                source: {
                    type: 'Literal',
                    value: './foo.js',
                    start: 7,
                    span: 10
                }
            });

            t.eq(parse(code2), {
                type: 'ImportDeclaration',
                specifiers: [],
                source: {
                    type: 'Literal',
                    value: 'bar.js',
                    start: 7,
                    span: 8
                }
            });
        });

        t.test(`parse import declaration with namespaced import`, t => {
            const code = `import * as foo from './bar.js';`;
            const code2 = `import * as blah_bar from "woot.js"`;

            t.eq(parse(code), {
                type: 'ImportDeclaration',
                specifiers: [{
                    type: 'ImportNamespaceSpecifier',
                    local: {
                        type: 'Identifier',
                        name: 'foo'
                    }
                }],
                source: {
                    type: 'Literal',
                    value: './bar.js',
                    start: 21,
                    span: 10
                }
            });

            t.eq(parse(code2), {
                type: 'ImportDeclaration',
                specifiers: [{
                    type: 'ImportNamespaceSpecifier',
                    local: {
                        type: 'Identifier',
                        name: 'blah_bar'
                    }
                }],
                source: {
                    type: 'Literal',
                    value: 'woot.js',
                    start: 26,
                    span: 9
                }
            });
        });

        t.test(`parse import declaration with named import`, t => {
            t.test('empty named import', t => {
                const code = `import {} from "bar.js"`;
                const codeMultiLine = `import {
            } from 'bar.js';`;
                const expect = (start, span) => ({
                    type: 'ImportDeclaration',
                    specifiers: [],
                    source: {
                        type: 'Literal',
                        value: 'bar.js',
                        start,
                        span
                    }
                });
                t.eq(parse(code), expect(15, 8));
                t.eq(parse(codeMultiLine), expect(28, 8));
            });

            t.test(`single named import`, t => {
                const code = `import {foo} from "bar.js"`;
                const codeMultiLine = `import {
                foo
            } from 'bar.js';`;
                const expect = (start, span) => ({
                    type: 'ImportDeclaration',
                    specifiers: [{
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'foo'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'foo'
                        }
                    }],
                    source: {
                        type: 'Literal',
                        value: 'bar.js',
                        start,
                        span
                    }
                });
                t.eq(parse(code), expect(18, 8));
                t.eq(parse(codeMultiLine), expect(48, 8));
            });

            t.test(`single named import with trailing coma`, t => {
                const code = `import {foo,} from "bar.js"`;
                const codeMultiLine = `import {
                foo,
            } from 'bar.js';`;
                const expect = (start, span) => ({
                    type: 'ImportDeclaration',
                    specifiers: [{
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'foo'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'foo'
                        }
                    }],
                    source: {
                        type: 'Literal',
                        value: 'bar.js',
                        start,
                        span
                    }
                });
                t.eq(parse(code), expect(19, 8));
                t.eq(parse(codeMultiLine), expect(49, 8));
            });

            t.test(`single named import with binding`, t => {
                const code = `import {foo as bar} from "whatever.js"`;
                const codeMultiLine = `import {
                foo as bar
            } from "whatever.js"`;
                const expect = (start, span) => ({
                    type: 'ImportDeclaration',
                    specifiers: [{
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'foo'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'bar'
                        }
                    }],
                    source: {
                        type: 'Literal',
                        value: 'whatever.js',
                        start,
                        span
                    }
                });

                t.eq(parse(code), expect(25, 13));
                t.eq(parse(codeMultiLine), expect(55, 13));
            });

            t.test('multiple named import', t => {
                const code = `import { foo, bar} from "woot.js"`;
                const codeMultiLine = `import { 
               foo, 
               bar
               } from "woot.js"`;
                const expect = (start, span) => ({
                    type: 'ImportDeclaration',
                    specifiers: [{
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'foo'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'foo'
                        }
                    }, {
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'bar'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'bar'
                        }
                    }],
                    source: {
                        type: 'Literal',
                        value: 'woot.js',
                        start,
                        span
                    }

                });
                t.eq(parse(code), expect(24, 9));
                t.eq(parse(codeMultiLine), expect(72, 9));
            });

            t.test(`multiple named import with trailing coma`, t => {
                const code = `import { foo, bar,} from "woot.js"`;
                const codeMultiLine = `import { 
               foo, 
               bar,
               } from "woot.js"`;
                const expect = (start, span) => ({
                    type: 'ImportDeclaration',
                    specifiers: [{
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'foo'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'foo'
                        }
                    }, {
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'bar'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'bar'
                        }
                    }],
                    source: {
                        type: 'Literal',
                        value: 'woot.js',
                        start,
                        span
                    }
                });
                t.eq(parse(code), expect(25, 9));
                t.eq(parse(codeMultiLine), expect(73, 9));
            });

            t.test(`multiple named import with bindings`, t => {
                const code = `import { foo as one, bar as two} from "woot.js"`;
                const codeMultiLine = `import { 
               foo as one, 
               bar as two
               } from "woot.js"`;
                const expect = (start, span) => ({
                    type: 'ImportDeclaration',
                    specifiers: [{
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'foo'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'one'
                        }
                    }, {
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'bar'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'two'
                        }
                    }],
                    source: {
                        type: 'Literal',
                        value: 'woot.js',
                        start,
                        span
                    }
                });
                t.eq(parse(code), expect(38, 9));
                t.eq(parse(codeMultiLine), expect(86, 9));
            });

            t.test(`multiple named import mixed with bindings`, t => {
                const code = `import { foo, bar as two} from "woot.js"`;
                const codeMultiLine = `import { 
               foo as one, 
               bar,
               } from "woot.js"`;
                const expected1 = {
                    type: 'ImportDeclaration',
                    specifiers: [{
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'foo'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'foo'
                        }
                    }, {
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'bar'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'two'
                        }
                    }],
                    source: {
                        type: 'Literal',
                        value: 'woot.js',
                        start: 31,
                        span: 9
                    }
                };
                const expected2 = {
                    type: 'ImportDeclaration',
                    specifiers: [{
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'foo'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'one'
                        }
                    }, {
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'bar'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'bar'
                        }
                    }],
                    source: {
                        type: 'Literal',
                        value: 'woot.js',
                        start: 80,
                        span: 9
                    }

                };
                t.eq(parse(code), expected1);
                t.eq(parse(codeMultiLine), expected2);
            });
        });

        t.test(`parse import declaration with default binding`, t => {

            t.test(`single default binding`, t => {
                const code = `import foo from 'bar.js'`;
                const codeMultiLine = `import foo
        from "bar.js"`;
                const expect = (start, span) => ({
                    type: 'ImportDeclaration',
                    specifiers: [{
                        type: 'ImportDefaultSpecifier',
                        local: {
                            type: 'Identifier',
                            name: 'foo'
                        }
                    }],
                    source: {
                        type: 'Literal',
                        value: 'bar.js',
                        start,
                        span
                    }
                });
                t.eq(parse(code), expect(16, 8));
                t.eq(parse(codeMultiLine), expect(24, 8));
            });

            t.test(`default binding then namespace import`, t => {
                const code = `import foo, * as bim from 'woot.js'`;
                const multiLineCode = `import foo, 
           * as bim from "woot.js";`;
                const expect = (start, span) => ({
                    type: 'ImportDeclaration',
                    specifiers: [{
                        type: 'ImportDefaultSpecifier',
                        local: {
                            type: 'Identifier',
                            name: 'foo'
                        }
                    }, {
                        type: 'ImportNamespaceSpecifier',
                        local: {
                            type: 'Identifier',
                            name: 'bim'
                        }
                    }],
                    source: {
                        type: 'Literal',
                        value: 'woot.js',
                        start,
                        span
                    }
                });
                t.eq(parse(code), expect(26, 9));
                t.eq(parse(multiLineCode), expect(38, 9));
            });

            t.test(`default binding then named import`, t => {
                const code = `import foo, {woot, bar as bim} from 'woot.js'`;
                const multiLineCode = `import foo, 
            { woot,
            bar as bim,
           } from "woot.js";`;
                const expect = (start, span) => ({
                    type: 'ImportDeclaration',
                    specifiers: [{
                        type: 'ImportDefaultSpecifier',
                        local: {
                            type: 'Identifier',
                            name: 'foo'
                        }
                    }, {
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'woot'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'woot'
                        }
                    }, {
                        type: 'ImportSpecifier',
                        imported: {
                            type: 'Identifier',
                            name: 'bar'
                        },
                        local: {
                            type: 'Identifier',
                            name: 'bim'
                        }
                    }],
                    source: {
                        type: 'Literal',
                        value: 'woot.js',
                        start,
                        span
                    }
                });
                t.eq(parse(code), expect(36, 9));
                t.eq(parse(multiLineCode), expect(75, 9));
            });
        });
    });
};