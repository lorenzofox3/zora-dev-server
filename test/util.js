export const streamify = emitter => {
    const buffer = [];
    let current = null;

    const handler = ev => buffer.push(JSON.parse(ev.text()));

    emitter.on('console', handler);

    // todo handle error

    const once = () => new Promise(resolve => {
        emitter.once('console', ev => {
            resolve();
        });
    });

    return {
        [Symbol.asyncIterator]: async function* () {
            while (true) {
                if (current && current.type === 'TEST_END' && current.offset === 0) {
                    return;
                }

                if (buffer.length) {
                    yield current = buffer.shift();
                    continue;
                }

                await once();
            }
        },
        return() {
            emitter.off('console', handler);
        }
    };
};

export const combine = async function* (...streams) {
    for (const st of streams) {
        yield* st;
    }
};
