export {tapeTapLike, mochaTapLike} from 'zora';
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
