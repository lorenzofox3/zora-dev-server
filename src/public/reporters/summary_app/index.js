import {ZoraTestSuite} from './zora_test_suite.js';
import {ZoraTestFile} from './zora_test_file.js';

export const reporter = ({testFiles = []}) => {

    const customElementRegistry = window.customElements;
    if (!customElementRegistry.get('zora-test-suite')) {
        customElementRegistry.define('zora-test-suite', ZoraTestSuite);
    }

    if (!customElementRegistry.get('zora-test-file')) {
        customElementRegistry.define('zora-test-file', ZoraTestFile);
    }

    const testSuiteElement = document.createElement('zora-test-suite');
    for (const f of testFiles) {
        testSuiteElement.addTestFile(f);
    }
    document.getElementsByTagName('body')[0].appendChild(testSuiteElement);

    return async stream => {

        let current = null;

        for await (const message of stream) {

            if (message.type === 'BAIL_OUT') {
                testSuiteElement.errored(current, message.data);
            }

            if (message.type === 'TEST_START' && message.offset === 0) {
                current = message.data.description;
            }

            if (message.type === 'ASSERTION') {
                if (message.data.operator) {
                    if (message.data.pass) {
                        testSuiteElement.incrementPass(current);
                    } else {
                        testSuiteElement.incrementFail(current);
                    }
                } else if (message.data.skip) {
                    testSuiteElement.incrementSkip(current);
                }
            }

            if (message.type === 'TEST_END' && message.offset === 0) {
                testSuiteElement.done(current);
            }
        }
    };
};