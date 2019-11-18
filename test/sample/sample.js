import * as st from 'smart-table-core';

export default t => {
    t.ok(true, 'whatever');

    t.test(`foo`, t=>{
        throw new Error('oh no !')
    });

    t.test('after thrown', t=>{
        t.ok(true);
    });
};