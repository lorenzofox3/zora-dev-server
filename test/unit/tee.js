import {tee} from '../../src/public/reporters/tee.js';

export default t => {

    const stream = async function* () {
        let i = 0;
        while (true) {
            yield i++;
        }
    };

    t.test(`tee on async iterator should create two independent iterators`, async t => {
        const [s1, s2] = tee(stream());
        t.eq(await s1.next(), {done: false, value: 0});
        t.eq(await s1.next(), {done: false, value: 1});
        t.eq(await s1.next(), {done: false, value: 2});

        t.eq(await s2.next(), {done: false, value: 0});
        t.eq(await s2.next(), {done: false, value: 1});
        t.eq(await s2.next(), {done: false, value: 2});
        t.eq(await s2.next(), {done: false, value: 3});

        t.eq(await s1.next(), {done: false, value: 3});
    });

    t.test(`when the source is done the tees are done once their buffers are empty`, async t => {
        const sourceStream = stream();
        const [s1, s2] = tee(sourceStream);
        t.eq(await s1.next(), {done: false, value: 0});
        t.eq(await s1.next(), {done: false, value: 1});
        t.eq(await s1.next(), {done: false, value: 2});

        t.eq(await s2.next(), {done: false, value: 0});

        await sourceStream.return();

        t.eq(await s1.next(), {done: true});

        t.eq(await s2.next(), {done: false, value: 1});
        t.eq(await s2.next(), {done: false, value: 2});
        t.eq(await s2.next(), {done: true});
    });

    t.test(`teed stream can be done independently than its sibling`, async t => {
        const sourceStream = stream();
        const [s1, s2] = tee(sourceStream);
        t.eq(await s1.next(), {done: false, value: 0});
        t.eq(await s1.next(), {done: false, value: 1});

        await s1.return();

        t.eq(await s1.next(), {done: true});

        t.eq(await s2.next(), {done: false, value: 0});
        t.eq(await s2.next(), {done: false, value: 1});
        t.eq(await s2.next(), {done: false, value: 2});
    });
}