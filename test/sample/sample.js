import * as st from 'smart-table-core';

export default t => {
    t.ok(true, 'whatever');

    t.test(`foo`, t=>{
        t.eq(4,4);
        t.skip('whatever')
    })
};