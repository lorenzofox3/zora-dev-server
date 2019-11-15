export default t => {
    t.skip(`should fail`, t => {
        t.eq({foo: 'bar'}, {foo: 'baz'});
    });

    t.skip('to do man');
}