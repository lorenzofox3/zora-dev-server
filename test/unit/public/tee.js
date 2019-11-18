import {tee} from '../../../src/public/reporters/tee.js';

const wait = (time = 50) => new Promise(resolve => setTimeout(() => resolve(), time));

export default t => {
    const stream = async function* () {
        let i = 0;
        while (true) {
            yield {counter: i++};
        }
    };

    t.test(`tee on async iterator should create two independent iterators`, async t => {
        const [s1, s2] = tee(stream());
        t.eq(await s1.next(), {done: false, value: {counter: 0}});
        t.eq(await s1.next(), {done: false, value: {counter: 1}});
        t.eq(await s1.next(), {done: false, value: {counter: 2}});

        t.eq(await s2.next(), {done: false, value: {counter: 0}});
        t.eq(await s2.next(), {done: false, value: {counter: 1}});
        t.eq(await s2.next(), {done: false, value: {counter: 2}});
        t.eq(await s2.next(), {done: false, value: {counter: 3}});

        t.eq(await s1.next(), {done: false, value: {counter: 3}});
    });

    t.test(`when the source is done the tees are done once their buffers are empty`, async t => {
        const sourceStream = stream();
        const [s1, s2] = tee(sourceStream);
        t.eq(await s1.next(), {done: false, value: {counter: 0}});
        t.eq(await s1.next(), {done: false, value: {counter: 1}});
        t.eq(await s1.next(), {done: false, value: {counter: 2}});

        t.eq(await s2.next(), {done: false, value: {counter: 0}});

        await sourceStream.return();

        t.eq(await s1.next(), {done: true});

        t.eq(await s2.next(), {done: false, value: {counter: 1}});
        t.eq(await s2.next(), {done: false, value: {counter: 2}});
        t.eq(await s2.next(), {done: true});
    });

    t.test(`teed stream can be done independently than its sibling`, async t => {
        const sourceStream = stream();
        const [s1, s2] = tee(sourceStream);
        t.eq(await s1.next(), {done: false, value: {counter: 0}});
        t.eq(await s1.next(), {done: false, value: {counter: 1}});

        await s1.return();

        t.eq(await s1.next(), {done: true});

        t.eq(await s2.next(), {done: false, value: {counter: 0}});
        t.eq(await s2.next(), {done: false, value: {counter: 1}});
        t.eq(await s2.next(), {done: false, value: {counter: 2}});
    });

    t.test('if a stream change the item, its sibling should see as it came from the source', async t => {
        const sourceStream = stream();
        const [s1, s2] = tee(sourceStream);
        const {value} = await s1.next();
        value.counter = 666;
        t.eq(value, {counter: 666});
        t.eq(await s2.next(), {done: false, value: {counter: 0}});
    });

    t.skip(`if the source is done but one of the child stream's buffer is not empty, this one is not done`, async t => {
        const sourceStream = stream();
        const [s1, s2] = tee(sourceStream);
        const mapped = (async function* () {
            for await (const m of s1) {
                await wait(50);
                yield m;
            }
        })();

        const m1 = mapped.next();
        const si1 = await s2.next();
        const si2 = await s2.next();
        const m2 = mapped.next();
        await sourceStream.return();
        t.eq(await m1, {done: false, value: {counter: 0}});
        t.eq(si1, {done: false, value: {counter: 0}});
        t.eq(si2, {done: false, value: {counter: 1}});
        t.eq(await m2, {done: false, value: {counter: 1}});
    });
}