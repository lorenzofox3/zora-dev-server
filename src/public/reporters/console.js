export const consoleTestStart = logger => message => logger.group(message.data.description);
export const consoleAssertion = logger => message => {
    if (message.data.operator) {
        // an assertion
        if (message.data.pass) {
            logger.log(message.data.description);
        } else {
            const {at: location, expected, actual, operator} = message.data;
            const parts = location.split('/');
            let pathIndex = parts.findIndex(p => p.includes('localhost'));
            const filePath = parts.slice(pathIndex + 1);
            const url = new URL(filePath.join('/'), window.location.origin);
            logger.error(url.href);
            logger.table({expected, actual});
        }
    } else if (message.data.skip) {
        // we log sub test point only they are skipped
        logger.warn(`SKIP: ${message.data.description}`);
    }
};
export const consoleTestEnd = logger => message => logger.groupEnd();
export const reporter = ({logger = window.console}) => {

    const testStart = consoleTestStart(logger);
    const assertion = consoleAssertion(logger);
    const testEnd = consoleTestEnd(logger);

    return async stream => {
        for await (const message of stream) {
            switch (message.type) {
                case 'BAIL_OUT':
                    throw message.data;
                case 'TEST_START':
                    testStart(message);
                    break;
                case 'ASSERTION':
                    assertion(message);
                    break;
                case 'TEST_END':
                    testEnd(message);
                    break;
            }
        }
    };
};