import {harness, resolveReporter, tee} from '/_zora/test_harness.js';

async function* consume(iterable) {
    yield* iterable;
}

window.addEventListener('load', () => {
    const {reporter} = window.__zora__;
    if (reporter.length > 1) {
        const twoReporters = reporter.slice(0, 2);
        const sourceStreams = tee(consume(harness));
        twoReporters.forEach((r, i) => {
            const rep = resolveReporter(r)(window.__zora__);
            rep(sourceStreams[i]);
        });
    } else {
        harness.report(resolveReporter(reporter[0])(window.__zora__));
    }
});