import {createHarness} from 'zora';
import * as st from 'smart-table-core';
const harness = createHarness();

export const test = harness.test.bind(harness);
export const report = harness.report.bind(harness);

window.addEventListener('load', ev => {
    report();
});