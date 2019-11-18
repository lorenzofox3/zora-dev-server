async function* teefy(source, ...buffers) {
    for await (const b of source) {
        for (const buffer of buffers) {
            buffer.push(Object.assign({}, b));
        }
        yield b;
    }
}

const StreamPrototype = {
    [Symbol.asyncIterator]() {
        return this;
    },

    async next() {
        if (this.done) {
            return {
                done: true
            };
        }

        if (this.buffer.length) {
            return {value: this.buffer.shift(), done: false};
        }

        const {done} = await this.source.next();
        this.done = done && this.buffer.length === 0;
        return this.next();
    },

    async return() {
        this.done = true;
    }
};

const iterator = (source, buffer) => Object.assign(Object.create(StreamPrototype, {
    source: {
        value: source
    },
    buffer: {
        value: buffer
    }
}), {done: false});

export const tee = (stream, count = 2) => {
    const buffers = (new Array(count))
        .fill(0)
        .map(_ => []);

    const source = teefy(stream, ...buffers);
    return buffers.map(b => iterator(source, b));
};