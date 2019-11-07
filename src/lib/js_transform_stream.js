import {parse} from './import_parser.js';
import {extname} from 'path';
import {resolver} from './module_resolver.js';

export const replace = (original, sourceInfo) => original.substring(0, sourceInfo.start)
    + JSON.stringify(sourceInfo.modulePath)
    + original.substring(sourceInfo.start + sourceInfo.span);

const collectImport = (chunk, resolve) => {
    const changeList = [];
    let lastIndex = 0;
    while (true) {
        try {
            const index = lastIndex = chunk.indexOf('import', lastIndex);
            if (index === -1) {
                break;
            }
            const {source} = parse(chunk.substring(index), index);
            if (!extname(source.value)) {
                // we insert them in reverse order so the tracking index remain accurate
                changeList.unshift({...source, modulePath: resolve(source.value)});
            }
            lastIndex += source.start + source.span;
        } catch (e) {
            // could not parse: it must not be an import declaration
            lastIndex++;
        }
    }
    return changeList;
};

// todo refactor
const collectExport = (chunk, resolve) => {
    const changeList = [];
    let lastIndex = 0;
    while (true) {
        try {
            const index = lastIndex = chunk.indexOf('export', lastIndex);
            const fromIndex = chunk.indexOf('from', lastIndex);
            if (index === -1 || fromIndex === -1) {
                break;
            }
            const result = parse(chunk.substring(index), index);
            if (result && !extname(result.source.value)) {
                const source = result.source;
                // we insert them in reverse order so the tracking index remain accurate
                changeList.unshift({...source, modulePath: resolve(source.value)});
                lastIndex += source.start + source.span - 1;
            }
            lastIndex++;
        } catch (e) {
            // could not parse: it must not be an import declaration
            lastIndex++;
        }
    }
    return changeList;
};

export const transform = async function* (stream, resolve = resolver()) {
    for await (const ch of stream) {
        const chunk = ch.toString();
        if (!chunk.includes('import') && !chunk.includes('from')) {
            yield chunk;
            continue;
        }

        const importChangeList = collectImport(chunk, resolve);
        const exportChangeList = collectExport(chunk, resolve);
        // replace
        yield importChangeList.concat(exportChangeList).reduce(replace, chunk);
    }
};