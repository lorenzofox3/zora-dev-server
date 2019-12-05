export const reporter = ({logger = window.console}) => async stream => {
    for await (const m of stream) {
        logger.log(JSON.stringify(m));
    }
};