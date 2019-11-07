import {Proto as RawProto} from './raw_file.js';

const Proto = Object.assign({}, RawProto, {
    body() {
        return html(this.path);
    }
});

export const fileHandler = (file, options = {}) => {
    const actualPath = file.replace(/\.test$/, '.js');
    return Object.create(Proto, {
        type: {
            enumerable: true,
            value: 'text/html; charset=utf8'
        },
        path: {
            value: actualPath
        }
    });
};

const html = path => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tests for: ${path}</title>
</head>
<body>
<script type="module">
import {test} from '/_zora/test_runner.js';
import spec from '${path}';
test('${path}', spec);
</script>
</body>
</html>`;
};

