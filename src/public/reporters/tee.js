async function* teefy(source, buffer1, buffer2) {
    for await (const b of source) {
        buffer1.push(b);
        buffer2.push(b);
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
        this.done = done;
        return this.next();
    },

    async return() {
        this.done = true;
        // todo handle the termination of source if both streams are done ?
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

export const tee = stream => {

    const buffer1 = [];
    const buffer2 = [];

    const source = teefy(stream, buffer1, buffer2);

    return [iterator(source, buffer1), iterator(source, buffer2)];
};