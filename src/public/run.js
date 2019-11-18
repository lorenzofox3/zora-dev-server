import {harness, resolveReporter, tee} from '/_zora/test_harness.js';

async function* consume(stream) {
    yield* stream;
}

window.addEventListener('load', () => {
    const {reporter} = window.__zora__;
    if (reporter.length > 1) {
        const sourceStreams = tee(consume(harness), reporter.length);
        reporter.forEach((r, i) => {
            const rep = resolveReporter(r)(window.__zora__);
            rep(sourceStreams[i]);
        });
    } else {
        harness.report(resolveReporter(reporter[0])(window.__zora__));
    }
});