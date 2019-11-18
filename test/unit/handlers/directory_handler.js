import {extensionToIcon, fileHandler} from '../../../src/handlers/directory_handler.js';

export default t => {
    t.test(`directory handler should have a type matching the expected mime type`, async t => {
        t.eq(fileHandler('./src').type, 'text/html; charset=utf-8');
    });

    t.test(`extensionToIcon should files with js, mjs and ts extension as source files`, t => {
        t.eq(extensionToIcon('foo.js'), '/_zora/media/git.svg');
        t.eq(extensionToIcon('foo.mjs'), '/_zora/media/git.svg');
        t.eq(extensionToIcon('foo.ts'), '/_zora/media/git.svg');
    });

    t.test('file without extension should be treated as folder only when they are folder', t => {
        t.eq(extensionToIcon('./test'), '/_zora/media/folder-open.svg');
        t.eq(extensionToIcon('.gitignore'), '/_zora/media/file-text.svg');
    });

    t.test('unknown extension should default to text file', t => {
        t.eq(extensionToIcon('file.md'), '/_zora/media/file-text.svg');
    });

    t.skip(`todo : check render`);
}