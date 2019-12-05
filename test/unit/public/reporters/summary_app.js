import {ZoraTestFile} from '../../../../src/public/reporters/summary_app/zora_test_file.js';

export default t => {
    window.customElements.define('zora-test-file', ZoraTestFile);

    t.test(`zora-test-file element`, t => {
        t.test(`instance getters should mirror matching attributes`, t => {
            const element = document.createElement('zora-test-file');
            element.setAttribute('file', 'foo.js');
            element.setAttribute('pass', '5');
            element.setAttribute('fail', '1');
            element.setAttribute('skip', '3');

            t.eq(element.fileName, 'foo.js');
            t.eq(element.pass, 5);
            t.eq(element.fail, 1);
            t.eq(element.skip, 3);
        });
    });
};