import {createHarness} from '/node_modules/zora/dist/bundle/module.js';

const harness = createHarness();

export const test = harness.test.bind(harness);
export const report = harness.report.bind(harness);