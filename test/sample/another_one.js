export default t => {
    t.test(`should fail`, t => {
        t.eq({foo: 'bar'}, {foo: 'baz'});
    });

    t.skip('to do man');
}