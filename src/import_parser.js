/**
 * Pragmatic parser for import declarations
 * It is not (yet) 100% spec compliant, but will do the job in most of the cases
 * @warning: It is not meant to check correctness of the syntax, on the contrary it assumes syntax is correct
 * @todo
 * - proper unicode
 * - surrogate pairs
 * - escaped sequence
 */

const AS = Object.freeze({
    type: 'AS'
});
const IMPORT = Object.freeze({
    type: 'IMPORT'
});
const FROM = Object.freeze({
    type: 'FROM'
});
const EOS = Object.freeze({
    type: 'EOS'
});
const STAR = Object.freeze({
    type: 'STAR'
});
const BRACKET_OPEN = Object.freeze({
    type: 'BRACKET_OPEN'
});
const BRACKET_CLOSE = Object.freeze({
    type: 'BRACKET_CLOSE'
});
const COMA = Object.freeze({
    type: 'COMA'
});
const SEMI_COLON = Object.freeze({
    type: 'SEMI_COLON'
});

const getPunctuatorToken = symbol => {
    switch (symbol) {
        case ';':
            return SEMI_COLON;
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

const source = input => {
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
            if (buffer.length) {
                return {
                    value: buffer.shift(),
                    done: false
                };
            }
            return sourceIterator.next();
        }
    };
};

const scanIdentifier = (stream, buffer = '') => {
    const {value: next, done} = stream.peek();

    if (done || !identifierContinue.test(next)) {
        switch (buffer) {
            case 'import':
                return IMPORT;
            case 'as':
                return AS;
            case 'from':
                return FROM;
            default:
                return {
                    type: 'IDENTIFIER',
                    value: buffer
                };
        }
    }

    stream.eat();

    return scanIdentifier(stream, buffer + next);
};

const scanWhiteSpace = stream => {
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
                type: 'STRING_LITERAL',
                value: `${buffer}`
            };
        }

        if (next === '\\') {
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
        stream.eat();
        return scan(stream);
    };
};

const scanDoubleQuoteStringLiteral = scanStringLiteral();
const scanSingleQuoteStringLiteral = scanStringLiteral('\'');

const identifierStartRegexp = /[a-z]|_|\$/i;
const identifierContinue = /\w|\$/;
const whiteSpaceRegexp = /\s/;
const punctuatorList = [',', ';', '{', '}'];

const scan = stream => {
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

const tokenize = exports.tokenize = code => {
    const src = source(code);
    return {
        [Symbol.iterator]: function* () {
            while (true) {
                const token = scan(src);
                if (token === EOS) {
                    return {
                        done: true
                    };
                }
                yield token;
            }
        }
    };
};

const expect = token => stream => {
    const {value: tok} = stream.peek();
    if (token !== tok) {
        throw new Error(`expected token: ${token.type}, but got: ${tok && tok.type}`);
    }
    stream.eat();
};

const expectImport = expect(IMPORT);
const expectAs = expect(AS);

const parseImportDeclaration = tokenStream => {
    expectImport(tokenStream);
    const node = {type: 'ImportDeclaration'};
    const {value: next} = tokenStream.peek();

    if (next.type === 'STRING_LITERAL') {
        // module specifier
        //todo
        return node;
    }

    if (next.type === 'IDENTIFIER') {
        //ImportedDefaultBinding

    }

    if (next === STAR) {
        tokenStream.eat();
        // NameSpaceImport

        // todo
    }

    if (next === BRACKET_OPEN) {
        tokenStream.eat();
        const node = parseNamedImport(tokenStream);
    }

    //FROM clause

};

const parseNamedImport = (stream, list = []) => {
    const {value: next} = stream.peek();
    if (next === BRACKET_CLOSE) {
        stream.eat();
        return list;
    }
};

const parseNameSpaceImport = stream => {
    expectAs(stream);
    const {value: next} = stream.next();
    if (!next || next.type !== 'IDENTIFIER') {
        throw new Error(`Expected identifier token but got: ${next && next.type}`);
    }
    return {
        type: 'NameSpaceImport',
        as: next.value
    };
};

const parseImportedDefaultBinding = stream => {

};

const importSpecifier = stream => {

};