import {createHarness} from 'zora';
import {consoleReporter, summaryApp, tap, tapIndent} from '/_zora/reporters.js';

export {tee} from './reporters/tee.js';

export const resolveReporter = reporter => {
    switch (reporter) {
        case 'tap':
            return tap;
        case 'tap-indent':
            return tapIndent;
        case 'summary-app':
            return summaryApp;
        default:
            return consoleReporter;
    }
};

export const harness = createHarness();