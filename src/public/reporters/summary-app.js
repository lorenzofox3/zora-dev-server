const zoraTestSuiteTemplate = document.createElement('template');
zoraTestSuiteTemplate.innerHTML = `
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

const zoraTestFileTemplate = document.createElement('template');
zoraTestFileTemplate.innerHTML = `
<style>
:host(:not(.passing)) #pass-icon{
    display: none;
}
:host(.passing) #fail-icon, :host(.skipping) #fail-icon{
    display: none;
}
:host(:not(.skipping)) #skip-icon{
    display: none;
}

li{
    display: flex;
    align-items: center;
}

#count{
    font-size: 0.95em;
    font-style: italic;
}

li > * {
    padding: 0.25em;
    font-weight: lighter;
}

a{
    text-decoration: none;
    color:#316a8e;
    border-bottom: 2px solid currentColor;
}

img{
    height: 1.5em;
}

a:hover, a:focus{
    background: lightgray;
}

</style>
<li>
    <img id="pass-icon" alt="pass icon" src="/_zora/media/cool.svg"/>
    <img id="fail-icon" alt="fail icon" src="/_zora/media/confused.svg"/>
    <img id="skip-icon" alt="skip icon" src="/_zora/media/neutral.svg"/>
    <div>
        <a id="file"></a>
        <a id="src-file">(src)</a>
    </div>
    <div id="count">
        <span id="pass">(0/0)</span>
    </div>
    <div id="dot"></div>
</li>`;

export class ZoraTestFile extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(zoraTestFileTemplate.content.cloneNode(true));
    }

    static get observedAttributes() {
        return ['file', 'pass', 'fail', 'skip'];
    }

    get fileName() {
        return this.getAttribute('file');
    }

    set fileName(val) {
        return this.setAttribute('file', val);
    }

    get total() {
        return this.pass + this.fail + this.skip;
    }

    get pass() {
        return this.hasAttribute('pass') ?
            Number(this.getAttribute('pass')) : 0;
    }

    get fail() {
        return this.hasAttribute('fail') ?
            Number(this.getAttribute('fail')) : 0;
    }

    get skip() {
        return this.hasAttribute('skip') ?
            Number(this.getAttribute('skip')) : 0;
    }

    get status() {
        return this.fail ? 'failing' : (this.skip ? 'skipping' : 'passing');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (['fail', 'skip', 'pass'].includes(name)) {
            this.shadowRoot.getElementById('pass').textContent = `(${this.pass + this.skip}/${this.total})${this.skip ? ` - ${this.skip} skipped` : ''}`;
            this.setAttribute('class', this.status);
        } else {
            this.setAttribute('id', newValue);
            const fileLink = this.shadowRoot.getElementById(name);
            const srcFileLink = this.shadowRoot.getElementById('src-file');
            fileLink.textContent = newValue;
            const testLink = new URL(newValue.replace(/\.js$/, '.test'), window.location.origin);
            const searchParams = testLink.searchParams;
            searchParams.append('reporter', 'summary-app');
            searchParams.append('reporter', 'console');
            testLink.search = searchParams.toString();
            fileLink.setAttribute('href', testLink.href);
            srcFileLink.setAttribute('href', newValue);
        }
    }

    incrementPass() {
        this.setAttribute('pass', String(this.pass + 1));
    }

    incrementFail() {
        this.setAttribute('fail', String(this.fail + 1));
    }

    incrementSkip() {
        this.setAttribute('skip', String(this.skip + 1));
    }
}

export class ZoraTestSuite extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(zoraTestSuiteTemplate.content.cloneNode(true));
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
            // fileElement.incrementPass();
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
}

export const reporter = ({testFiles = []}) => {

    const customElementRegistry = window.customElements;
    if (!customElementRegistry.get('zora-test-suite')) {
        customElementRegistry.define('zora-test-suite', ZoraTestSuite);
    }

    if (!customElementRegistry.get('zora-test-file')) {
        customElementRegistry.define('zora-test-file', ZoraTestFile);
    }

    const testSuiteElement = document.createElement('zora-test-suite');
    for (const f of testFiles) {
        testSuiteElement.addTestFile(f);
    }
    document.getElementsByTagName('body')[0].appendChild(testSuiteElement);

    return async stream => {

        let current = null;

        for await (const message of stream) {
            if (message.type === 'TEST_START' && message.offset === 0) {
                current = message.data.description;
            }

            if (message.type === 'ASSERTION') {
                if (message.data.operator) {
                    if (message.data.pass) {
                        testSuiteElement.incrementPass(current);
                    } else {
                        testSuiteElement.incrementFail(current);
                    }
                } else if (message.data.skip) {
                    testSuiteElement.incrementSkip(current);
                }
            }

            if (message.type === 'TEST_END' && message.offset === 0) {
                testSuiteElement.done(current);
            }
        }
    };
};