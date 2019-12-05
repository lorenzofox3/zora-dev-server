const template = document.createElement('template');
template.innerHTML = `
<style>
:host(:not(.passing)) #pass-icon{
    display: none;
}

:host(:not(.skipping)) #skip-icon{
    display: none;
}

:host(:not(.failing)) #fail-icon{
    display: none;
}

:host(.failing) #pending-icon,
:host(.passing) #pending-icon,
:host(.skipping) #pending-icon{
    display: none;
}

.fail{
    color:red;
    font-weight: bold;
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
    <img id="pending-icon" alt="pending icon" src="/_zora/media/neutral_gray.svg"/>
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

const createTestLink = (val, origin = window.location.origin) => {
    const testLink = new URL(val.replace(/\.js$/, '.test'), origin);
    const searchParams = testLink.searchParams;
    searchParams.append('reporter', 'summary-app');
    searchParams.append('reporter', 'console');
    testLink.search = searchParams.toString();
    return testLink.href;
};

export class ZoraTestFile extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
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
            const countElement = this.shadowRoot.getElementById('pass');
            countElement.textContent = `(${this.pass + this.skip}/${this.total})${this.skip ? ` - ${this.skip} skipped` : ''}`;
            if(this.error){
                const span = document.createElement('span');
                span.classList.add('fail');
                span.textContent= ' ERROR ';
                countElement.appendChild(span);
            }
            this.setAttribute('class', this.status);
        } else {
            this.setAttribute('id', newValue);
            const fileLink = this.shadowRoot.getElementById(name);
            const srcFileLink = this.shadowRoot.getElementById('src-file');
            fileLink.textContent = newValue;
            fileLink.setAttribute('href', createTestLink(newValue));
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

    errored(error) {
        this.error = error;
        this.incrementFail();
    }
}