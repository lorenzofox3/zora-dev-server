import {createHarness} from 'zora';
import {consoleReporter, raw, summaryApp, tap, tapIndent} from '/_zora/reporters.js';

export {tee} from './reporters/tee.js';

export const resolveReporter = reporter => {
    switch (reporter) {
        case 'tap':
            return tap;
        case 'tap-indent':
            return tapIndent;
        case 'summary-app':
            return summaryApp;
        case 'raw':
            return raw;
        default:
            return consoleReporter;
    }
};

export const harness = createHarness({runOnly: window.__zora__ && window.__zora__.runOnly});