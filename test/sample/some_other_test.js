import {square
} from '../../src/some_code.js';
import {map} from '../../src/with_dep.js';

const foo = 'bar';

export default a => {
    a.eq(square(2), 3, '2 * 2 = 4');

    a.test(`map stuff`, async t => {
        const result = [];
        for await (const i of map(x => x * 2, [0, 1, 2, 3, 4])) {
            result.push(i);
        }
        t.eq(result, [0, 2, 4, 6, 8]);
    });
}
