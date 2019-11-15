import {Proto as RawProto} from './raw_file.js';
import {contentType} from 'mime-types';

const Proto = Object.assign({}, RawProto, {
    body() {
        return html(this.path, [this.path], this.options);
    }
});

export const fileHandler = (file, options = {}) => {
    const actualPath = file.replace(/\.test$/, '.js');
    return Object.create(Proto, {
        type: {
            enumerable: true,
            value: contentType('text/html')
        },
        path: {
            value: actualPath
        },
        options: {
            value: options
        }
    });
};

export const html = (glob, files, {reporter = [], only = false}) => {
    const reporters = [...new Set(Array.isArray(reporter) ? reporter : [reporter])];
    if (!reporters.length) {
        reporters.push('console', 'summary-app');
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <base href="/">
    <title>Tests for: ${glob}</title>
    <link rel="stylesheet" href="/_zora/style.css"/>
    <link href="/_zora/media/favicon.ico" rel="icon">
    <link rel="modulepreload" href="/_zora/test_harness.js" as="script">
    <link rel="modulepreload" href="/_zora/run.js" as="script">
${files
        .map(path => `<link rel="modulepreload" href="/${path}" as="script">`)
        .join('')
    }
</head>
<body>
<script>
    window.__zora__ = Object.freeze({
        reporter: [${reporters.map(r => JSON.stringify(r)).join(',')}],    
        testFiles:[${files.map(f => JSON.stringify(f)).join(', ')}],
        glob:${JSON.stringify(glob)},
        runOnly:${Boolean(only)}
    })
</script>
${files
        .map(path => `
<script type="module">
    import {harness} from '/_zora/test_harness.js';
    import spec from '/${path}';
    
    if(${Boolean(only)}){
        harness.only('${path}', spec);
    } else {
        harness.test('${path}', spec);
    }
</script>`)
        .join('')
    }
<script type="module" src="/_zora/run.js"></script>
</body>
</html>`;
}

