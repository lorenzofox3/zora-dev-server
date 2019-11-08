export default t => {
    t.test(`should fail`, t => {
        t.eq('foo', 'fool');
    });
}