import {Proto as RawProto} from './raw_file.js';
import {contentType} from 'mime-types';

const Proto = Object.assign({}, RawProto, {
    body() {
        return html(this.path, [this.path]);
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
        }
    });
};

export const html = (glob, files) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <base href="/">
    <title>Tests for: ${glob}</title>
    <link href="/_zora/favicon.ico" rel="icon">
    <link rel="modulepreload" href="/_zora/test_runner.js" as="script">
${files
    .map(path => `<link rel="modulepreload" href="/${path}" as="script">`)
    .join('')
}
</head>
<body>
${files
    .map(path => `
<script type="module">
    import {test} from '/_zora/test_runner.js';
    import spec from '/${path}';
    test('${path}', spec);
</script>`)
    .join('')
}
</body>
</html>`;
