import {Readable, Stream} from 'stream';

export const from = input => {
    if (input instanceof Stream) {
        return input;
    }

    if (input[Symbol.asyncIterator]) {
        return Readable.from(input);
    }

    if (typeof input === 'string' || input instanceof Promise) {
        return from((async function* () {
            yield input;
        })());
    }

    return from(JSON.stringify(input));
};