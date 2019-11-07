import {parse} from '../../src/lib/import_parser.js';

export default t => {
    t.test(`parse export all declaration`, t => {
        const code = `export * from 'foo.js'`;
        const codeBis = `export * from "foo.js"`;
        const expected = {
            type: 'ExportAllDeclaration',
            source: {
                type: 'Literal',
                value: 'foo.js',
                start: 14,
                span: 8
            }
        };
        t.eq(parse(code), expected);
        t.eq(parse(codeBis), expected);
    });

    t.test(`parse export named export`, t => {
        t.test('empty named export', t => {
            const code = `export {} from "bar.js"`;
            const codeMultiLine = `export {
            } from 'bar.js';`;
            const expect = (start, span) => ({
                type: 'ExportNamedDeclaration',
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

        t.test(`single named export`, t => {
            const code = `export {foo} from "bar.js"`;
            const codeMultiLine = `export {
                foo
            } from 'bar.js';`;
            const expect = (start, span) => ({
                type: 'ExportNamedDeclaration',
                specifiers: [{
                    type: 'ExportSpecifier',
                    exported: {
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

        t.test(`single named export with trailing coma`, t => {
            const code = `export {foo,} from "bar.js"`;
            const codeMultiLine = `export {
                foo,
            } from 'bar.js';`;
            const expect = (start, span) => ({
                type: 'ExportNamedDeclaration',
                specifiers: [{
                    type: 'ExportSpecifier',
                    exported: {
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

        t.test(`single named export with binding`, t => {
            const code = `export {foo as bar} from "whatever.js"`;
            const codeMultiLine = `export {
                foo as bar
            } from "whatever.js"`;
            const expect = (start, span) => ({
                type: 'ExportNamedDeclaration',
                specifiers: [{
                    type: 'ExportSpecifier',
                    exported: {
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

        t.test(`multiple named export`, t => {
            const code = `export { foo, bar} from "woot.js"`;
            const codeMultiLine = `export { 
               foo, 
               bar
               } from "woot.js"`;
            const expect = (start, span) => ({
                type: 'ExportNamedDeclaration',
                specifiers: [{
                    type: 'ExportSpecifier',
                    exported: {
                        type: 'Identifier',
                        name: 'foo'
                    },
                    local: {
                        type: 'Identifier',
                        name: 'foo'
                    }
                }, {
                    type: 'ExportSpecifier',
                    exported: {
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

        t.test(`multiple named export with trailing coma`, t => {
            const code = `export { foo, bar,} from "woot.js"`;
            const codeMultiLine = `export { 
               foo, 
               bar,
               } from "woot.js"`;
            const expect = (start, span) => ({
                type: 'ExportNamedDeclaration',
                specifiers: [{
                    type: 'ExportSpecifier',
                    exported: {
                        type: 'Identifier',
                        name: 'foo'
                    },
                    local: {
                        type: 'Identifier',
                        name: 'foo'
                    }
                }, {
                    type: 'ExportSpecifier',
                    exported: {
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

        t.test(`multiple named export with bindings`, t => {
            const code = `export { foo as one, bar as two} from "woot.js"`;
            const codeMultiLine = `export { 
               foo as one, 
               bar as two
               } from "woot.js"`;
            const expect = (start, span) => ({
                type: 'ExportNamedDeclaration',
                specifiers: [{
                    type: 'ExportSpecifier',
                    exported: {
                        type: 'Identifier',
                        name: 'foo'
                    },
                    local: {
                        type: 'Identifier',
                        name: 'one'
                    }
                }, {
                    type: 'ExportSpecifier',
                    exported: {
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

        t.test(`multiple named export mixed with bindings`, t => {
            const code = `export { foo, bar as two} from "woot.js"`;
            const codeMultiLine = `export { 
               foo as one, 
               bar,
               } from "woot.js"`;
            const expected1 = {
                type: 'ExportNamedDeclaration',
                specifiers: [{
                    type: 'ExportSpecifier',
                    exported: {
                        type: 'Identifier',
                        name: 'foo'
                    },
                    local: {
                        type: 'Identifier',
                        name: 'foo'
                    }
                }, {
                    type: 'ExportSpecifier',
                    exported: {
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
                type: 'ExportNamedDeclaration',
                specifiers: [{
                    type: 'ExportSpecifier',
                    exported: {
                        type: 'Identifier',
                        name: 'foo'
                    },
                    local: {
                        type: 'Identifier',
                        name: 'one'
                    }
                }, {
                    type: 'ExportSpecifier',
                    exported: {
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
}