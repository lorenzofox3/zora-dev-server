import {memoize} from '../../../src/lib/util.js';

const stub = () => {
    const calls = [];
    const fn = (...args) => {
        calls.push(args);
        return [...args];
    };

    return Object.defineProperties(fn, {
        count: {
            get() {
                return calls.length;
            }
        },
        callFor: {
            value: (nth = 0) => calls[nth]
        }
    });
};

export default t => {
    t.test(`memoize`, t => {
        const stubFn = stub();
        const fn = memoize(stubFn);
        const res = fn('foo');
        const resBis = fn('foo');
        t.eq(res, ['foo']);
        t.eq(resBis, ['foo']);
        t.eq(stubFn.count, 1);
    });
};