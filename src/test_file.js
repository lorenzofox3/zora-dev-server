module.exports = (path, {reporter = 'tap-indent'} = {reporter: 'tap-indent'}) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tests for: ${path}</title>
</head>
<body>
<script type="module">
import {test, report} from '/_zora/test_runner.js';
import spec from '${path}';
test('${path}', spec);
report();
</script>
</body>
</html>`;
};