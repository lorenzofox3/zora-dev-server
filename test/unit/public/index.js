import puppeteer from 'puppeteer';
import {createServer} from '../../../src/web-server.js';
import {combine, streamify} from '../../util.js';
import {createHarness, mochaTapLike} from 'zora';

// prevent zora from auto reporting (an empty suite here): we are only interested in the reporters
createHarness();

const port = 7000;

const createReportingStream = browser => async path => {
    const page = await browser.newPage();
    const stream = streamify(page);
    await page.goto(`http://localhost:${port}/${path}`);
    return stream;
};

(async () => {
    const browser = await puppeteer.launch({});
    const server = await createServer().listen(port);
    try {
        const streams = await Promise.all([
            'test/unit/public/reporters/summary_app.test?reporter=raw',
            'test/unit/public/tee.test?reporter=raw'
        ].map(createReportingStream(browser)));

        const stream = combine(...streams);

        await mochaTapLike(stream);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await server.close();
        await browser.close();
    }
})();