export {tapeTapLike, mochaTapLike} from '/node_modules/zora/dist/bundle/module.js';
// fancy app

// dump
export const logReporter = (namespace, out = console) => async stream => {
    for await (const message of stream) {
        if (message.type === 'BAIL_OUT') {
            throw message.data;
        }
        out.log(`${JSON.stringify({
            namespace,
            message
        })}\n`);
    }
};
