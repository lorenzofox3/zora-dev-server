const template = document.createElement('template');
template.innerHTML = `
<style>
:host{
    display: block;
    font-family: sans-serif;
    padding: 0 2em; 
}
h2{
    border-bottom: 2px solid green;
    display: inline-block;
    font-weight: bold;
    margin: 0.5em 0;
}

ul{
    margin: 0;
    padding-left: 0;
}

</style>
<h2>Zora dev server tests</h2>
<ul id="test-files-container">
</ul>
`;

export class ZoraTestSuite extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this._testFiles = this.shadowRoot.getElementById('test-files-container').children;

    }

    get progress() {
        if (this._testFiles.length === 0) {
            return 0;
        }
    }

    done(file) { //update progress
        const fileElement = this._testFiles.namedItem(file);
        if (fileElement) {
            // todo update progress
        }
    }

    addTestFile(fileName) {
        const element = document.createElement('zora-test-file');
        element.fileName = fileName;
        this.shadowRoot.getElementById('test-files-container')
            .appendChild(element);
    }

    incrementPass(file) {
        const fileElement = this._testFiles.namedItem(file);
        if (fileElement) {
            fileElement.incrementPass();
        }
    }

    incrementFail(file) {
        const fileElement = this._testFiles.namedItem(file);
        if (fileElement) {
            fileElement.incrementFail();
        }
    }

    incrementSkip(file) {
        const fileElement = this._testFiles.namedItem(file);
        if (fileElement) {
            fileElement.incrementSkip();
        }
    }

    errored(file, error) {
        const fileElement = this._testFiles.namedItem(file);
        if (fileElement) {
            fileElement.errored(error);
        }
    }
}