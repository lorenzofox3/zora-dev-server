import {parse} from './import_parser.js';
import {extname} from 'path';
import {resolver} from './module_resolver.js';

export const replace = (original, sourceInfo) => original.substring(0, sourceInfo.start)
    + JSON.stringify(sourceInfo.modulePath)
    + original.substring(sourceInfo.start + sourceInfo.span);

const collector = keyword => (chunk, resolve) => {
    const changeList = [];
    let lastIndex = 0;
    while (true) {
        try {
            const index = lastIndex = chunk.indexOf(keyword, lastIndex);
            if (index === -1) {
                break;
            }
            const result = parse(chunk.substring(index), index);
            if (result && !extname(result.source.value)) {
                const source = result.source;
                changeList.push({...source, modulePath: resolve(source.value)});
                lastIndex = source.start + source.span - 1;
            }
            // still need to advance if parse does not match
            lastIndex++;
        } catch (e) {
            // could not parse: it must not be an import declaration
            lastIndex++;
        }
    }
    return changeList;
};

const collectImport = collector('import');
const collectExport = collector('export');

export const transform = async function* (stream, resolve = resolver()) {
    for await (const ch of stream) {
        const chunk = ch.toString();
        if (!chunk.includes('import') && !chunk.includes('from')) {
            yield chunk;
            continue;
        }

        const importChangeList = collectImport(chunk, resolve);
        const exportChangeList = collectExport(chunk, resolve);
        // replace starting by the end of the string so the index tracked remain consistent
        yield importChangeList
            .concat(exportChangeList)
            .sort((a, b) => a.start < b.start ? 1 : -1)
            .reduce(replace, chunk);
    }
};