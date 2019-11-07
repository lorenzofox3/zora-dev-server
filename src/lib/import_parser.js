/**
 * Pragmatic parser for import declarations
 * It is not (yet) 100% spec compliant, but will do the job in most of the cases
 * @warning: It is not meant to check correctness of the syntax, on the contrary it assumes syntax is correct
 * @todo
 * - proper unicode
 * - surrogate pairs
 * - escaped sequence
 */
export const AS = Object.freeze({
    type: 'AS'
});
export const IMPORT = Object.freeze({
    type: 'IMPORT'
});
export const EXPORT = Object.freeze({type: 'EXPORT'});
export const FROM = Object.freeze({
    type: 'FROM'
});
export const EOS = Object.freeze({
    type: 'EOS'
});
export const STAR = Object.freeze({
    type: 'STAR'
});
export const BRACKET_OPEN = Object.freeze({
    type: 'BRACKET_OPEN'
});
export const BRACKET_CLOSE = Object.freeze({
    type: 'BRACKET_CLOSE'
});
export const COMA = Object.freeze({
    type: 'COMA'
});

const identifierStartRegexp = /[a-z]|_|\$/i;
const identifierContinue = /\w|\$/;
const whiteSpaceRegexp = /\s/;
const punctuatorList = [',', ';', '{', '}'];

export const getPunctuatorToken = symbol => {
    switch (symbol) {
        case '{':
            return BRACKET_OPEN;
        case '}':
            return BRACKET_CLOSE;
        case ',':
            return COMA;
        default:
            throw new Error(`unknown punctuator: ${symbol}`);
    }
};

export const source = (input, offset = 0) => {
    let index = 0;
    let done = false;
    const buffer = [];
    const sourceIterator = input[Symbol.iterator]();

    return {
        [Symbol.iterator]() {
            return this;
        },

        peek(offset = 1) {
            if (buffer.length >= offset) {
                return buffer[offset - 1];
            }

            let i = offset;

            while (i > 0) {
                buffer.push(sourceIterator.next());
                i--;
            }

            return buffer[buffer.length - 1];
        },

        eat(number = 1) {
            let i = number;
            while (i > 0) {
                this.next();
                i--;
            }
            return this;
        },

        next() {

            if (done === true) {
                return {
                    done: true
                };
            }

            const item = buffer.length ? buffer.shift() : sourceIterator.next();

            done = item.done === true && buffer.length === 0;

            index++;
            return item;
        },
        return() {
            done = true;
            if (sourceIterator.return) {
                sourceIterator.return();
            }
        },
        currentIndex() {
            return offset + index;
        }
    };
};

export const scanIdentifier = (stream, buffer = '') => {
    const {value: next, done} = stream.peek();

    if (done || !identifierContinue.test(next)) {
        switch (buffer) {
            case 'import':
                return IMPORT;
            case 'as':
                return AS;
            case 'from':
                return FROM;
            case 'export':
                return EXPORT;
            default:
                return {
                    type: 'Identifier',
                    value: buffer
                };
        }
    }

    stream.eat();

    return scanIdentifier(stream, buffer + next);
};

export const scanWhiteSpace = stream => {
    const {value: next, done} = stream.peek();

    if (done || !whiteSpaceRegexp.test(next)) {
        return;
    }

    stream.eat();

    return scanWhiteSpace(stream);
};

const scanStringLiteral = (quote = '"') => {

    const scan = (stream, buffer = '') => {
        const {value: next} = stream.peek();

        if (next === quote) {
            stream.eat();
            return {
                type: 'Literal',
                value: `${buffer}`
            };
        }

        if (next === `\\`) {
            const {value} = stream.peek(2);
            if (value === quote) {
                stream.eat(2);
                return scan(stream, buffer + quote);
            }

        }

        stream.eat();

        return scan(stream, buffer + next);
    };

    return stream => {
        const start = stream.currentIndex();
        stream.eat();
        const token = scan(stream);
        return {
            ...token,
            start,
            span: stream.currentIndex() - start
        };
    };
};

export const scanDoubleQuoteStringLiteral = scanStringLiteral();
export const scanSingleQuoteStringLiteral = scanStringLiteral('\'');

export const scan = stream => {
    const {value: next, done} = stream.peek();

    if (done) {
        return EOS;
    }

    if (next === '*') {
        stream.eat();
        return STAR;
    }

    if (whiteSpaceRegexp.test(next)) {
        scanWhiteSpace(stream);
        return scan(stream);
    }

    if (punctuatorList.includes(next)) {
        stream.eat();
        return getPunctuatorToken(next);
    }

    if (identifierStartRegexp.test(next)) {
        return scanIdentifier(stream);
    }

    if (next === '"') {
        return scanDoubleQuoteStringLiteral(stream);
    }

    if (next === '\'') {
        return scanSingleQuoteStringLiteral(stream);
    }

    throw new Error(`Unknown character`);
};

export const tokenize = (code, offset = 0) => {
    const src = source(code, offset);
    return {
        [Symbol.iterator]: function* () {
            while (true) {
                const token = scan(src);
                if (token === EOS) {
                    src.return();
                    return {
                        done: true
                    };
                }
                yield token;
            }
        }
    };
};

export const expect = token => stream => {
    const {value: tok} = stream.peek();
    if (token !== tok) {
        throw new Error(`expected token: ${token.type}, but got: ${tok && tok.type}`);
    }
    return stream.next().value;
};

const expectImport = expect(IMPORT);
const expectAs = expect(AS);
const expectFrom = expect(FROM);
const expectExport = expect(EXPORT);
const expectType = type => stream => {
    const {value: next} = stream.peek();
    if (!next || next.type !== type) {
        throw new Error(`expected token type: ${type} but got ${next && next.type}`);
    }
    return stream.next().value;
};
const expectIdentifier = expectType('Identifier');
const expectStringLiteral = expectType('Literal');

export const parseNamedImport = (stream, list = []) => {
    const {value: next} = stream.peek();

    if (next === BRACKET_CLOSE) {
        stream.eat();
        return list;
    }

    if (next === COMA) {
        stream.eat();
        return parseNamedImport(stream, list);
    }

    const specifier = {
        type: 'ImportSpecifier'
    };

    const {type, value} = expectIdentifier(stream);
    const {value: afterIdentifier} = stream.peek();
    specifier.imported = {
        type,
        name: value
    };
    specifier.local = Object.assign({}, specifier.imported);

    if (afterIdentifier === AS) {
        stream.eat();
        const {value: identifier} = expectIdentifier(stream);
        specifier.local.name = identifier;
    }

    list.push(specifier);
    return parseNamedImport(stream, list);
};

export const parseNameSpaceImport = stream => {
    expectAs(stream);
    const {type, value} = expectIdentifier(stream);
    return {
        type: 'ImportNamespaceSpecifier',
        local: {
            type,
            name: value
        }
    };
};

export const parseImportedDefaultBinding = (stream, specifiers = []) => {
    const {type, value} = expectIdentifier(stream);
    specifiers.push({
        type: 'ImportDefaultSpecifier',
        local: {
            type,
            name: value
        }
    });

    const {value: next} = stream.peek();

    if (next !== COMA) {
        return specifiers;
    }

    stream.eat();

    const {value: nextSpecifier} = stream.next();

    if (nextSpecifier === BRACKET_OPEN) {
        return parseNamedImport(stream, specifiers);
    }

    specifiers.push(parseNameSpaceImport(stream));

    return specifiers;
};

export const parseFromClause = stream => {
    expectFrom(stream);
    return expectStringLiteral(stream);
};

export const parseImportDeclaration = tokenStream => {
    expectImport(tokenStream);
    const node = {
        type: 'ImportDeclaration',
        specifiers: []
    };
    const {value: next} = tokenStream.peek();

    if (next.type === 'Literal') {
        node.source = expectStringLiteral(tokenStream);
        return node;
    }

    if (next === STAR) {
        tokenStream.eat();
        node.specifiers.push(parseNameSpaceImport(tokenStream));
    }

    if (next.type === 'Identifier') {
        node.specifiers.push(...parseImportedDefaultBinding(tokenStream));
    }

    if (next === BRACKET_OPEN) {
        tokenStream.eat();
        node.specifiers.push(...parseNamedImport(tokenStream));
    }

    node.source = parseFromClause(tokenStream);
    tokenStream.return();
    return node;
};

export const parseExportDeclaration = tokenStream => {
    expectExport(tokenStream);
    const {value: next} = tokenStream.peek();
    let node;

    if (next === STAR) {
        tokenStream.eat();
        node = {
            type: 'ExportAllDeclaration'
        };
    }

    if (next === BRACKET_OPEN) {
        tokenStream.eat();
        const eventualNode = {
            type: 'ExportNamedDeclaration',
            specifiers: parseNamedImport(tokenStream)
                .map(({local, imported}) => ({
                    type: 'ExportSpecifier',
                    local,
                    exported: imported
                }))
        };

        node = (tokenStream.peek().value !== FROM) ? node : eventualNode;
    }

    if (!node) {
        return;
    }

    node.source = parseFromClause(tokenStream);
    tokenStream.return();
    return node;
};

export const parse = (code, offset = 0) => {
    const tokenStream = source(tokenize(code, offset));
    const {value} = tokenStream.peek();
    if (value === EXPORT) {
        return parseExportDeclaration(tokenStream);
    }
    return parseImportDeclaration(tokenStream);
};
