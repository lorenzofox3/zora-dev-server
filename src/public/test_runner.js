import {createHarness} from 'zora';
const harness = createHarness();

export const test = harness.test.bind(harness);
export const report = harness.report.bind(harness);

window.addEventListener('load', ev => {
    report();
});