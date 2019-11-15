# zora-dev-server

A dev server which serves your project files and run your tests in any modern browser without any configuration or extra build step.

## Motivation 

One of the most spread and targeted Javascript environment is the **browser**.
Javascript being an interpreted language, you don't need to compile your source code before the browser can run it. This is very handy to develop and test your program at a high pace.

However, in practice most of the programs which target the browser's environment **do** have compilation steps, at least for their *production* release:
1. you may want to bundle different structured source files together
2. you will probably optimize your code with minifiers and other tools

These steps are usually not mandatory to run *tests* on your source code and iterate quickly, yet there are very few tools at your reach to test javascript program directly in a browser in an efficient way.
Most of the times, in order to use these tools you will have to pre process your source code files which brings yet a different set of tools or plugins to configure (and the troubles that go with), while slowing down the whole development cycle unnecessarily.

Why is that so ?

Browser and Node come with different interfaces on top of Javascript. They are sometimes incompatible: a browser can not have access to the Operating System low level APIs such the file system; while at the opposite Node does not come with a Document Object Model (DOM).
So if you want to run with Node a program which references DOM interfaces, you'll need to mock them or implement them in the Node world (that's what [jsdom]() do for instance), however it will remain different than running your program in a *real* browser and you might face some unwanted discrepancies.
On the other side you might have code that can technically run in both environments but because other part the program references Node's native modules, it becomes incompatible with a browser environment. To tackle this issue you have to statically analyze your code and replace or remove references to Node's modules.

I believe the aforementioned problems are not very common (or easily workaround) because most of the time you'll develop a part of a program either for the browser either for Node and won't need to test that part in both environments. For the parts which are meant to be platform agnostic, then you should not bump into these problems as they will likely contain only EcmaScript code.

But there is another major pain point: the way **modules** are defined, packaged and distributed through the registry used in most of the cases together with Node (NPM). A browser has no clue of the Commonjs module format defined by Node and does not have any ``require`` method. While Node has the ability to understand and use EcmaScript module format, and even if people now are tending to distribute their libraries in both module formats (CJS and ESM), you still need to be careful when writing an import statement. 
The browser only understands a module definition through URLs while Node will be able to resolve packages by name. You could workaround this problem by taking the habit of always requiring module by their path (with extension!) even with your dependencies in the ``node_modules``. But in practice, this is not doable: you would need to go through every dependency to find where an eventual ESM module file is and hope every package you use is written the same way.
Therefore it is way easier to stick to the ``package.json`` contract and write code such

```javascript
import {test} from 'zora';
// rather than
import {test} from 'node_modules/zora/dist/bundle/module.js';
```       

then transforming that code with some tool.

The idea of this package is to let you write source code in the convenient way while serving file in a way browsers can understand and run your tests without any compilation or extra step. This should allow you to iterate quickly on your development without extra set up and configuration cost. 

## Installation

``npm install --save-dev zora-dev-server`` or globally ``npm install -g zora-dev-server``

## Usage

// see the video for a tour of what you can do

Write your test files with a default export function taking a zora's assertion object as argument. 

Note: interestingly, this convention allows you to run your test files with [pta test runner](https://github.com/lorenzofox3/zora-node)(for Node environment) as well.

```javascript
// test/answer.js
export default t => {
    t.test('some test', t=>{
        t.eq(40+2,42, 'this answer');
    });
}
``` 

Now if you want to run your test in the browser, all you have to do is to start a zora dev server and visit [http://localhost:3000/test/answer.test](http://localhost:3000/test/answer.test) with the browser you want to use.

Note: Your browser must be *modern* and understand module scripts (it is the case for every evergreen browser: Firefox, Chrome, Edge, Opera, Safari, etc) 

See the [reporters section](#reporters) to understand how to analyze and troubleshoot your tests the most efficiently. 

## CLI

``zds`` will start the server rooted to the current working directory

### configuration 

The defaults will allow you to work with no configuration in most of the cases. But if for some reason you wish to change the default settings you can pass options to the cli or with a config file

#### port (--port)

Change the port of the server (default is 3000)

#### config (--config, -c)

Point to a file whose properties are any option you can pass to the CLI plus 

#### dependenciesMap (through config file only)

This will overwrite the way the dev server resolve a given package. 

For example the file server will resolve the package ``zora`` to the URL ``/node_modules/zora/dist/bundle/module.js``.
If for some reason you want to change it or if the file server fails to resolve a given package to a valid ESM module file, you can tell it to use a specific URL

```json
{
  "port": 4000,
  "dependenciesMap": {
    "package_a": "/path/to/es/module.js", // in that case the root "/" match the current working directory 
    "package_b": "/path/to/other/es/module.js", 
    "zora": "https://unpkg.com/zora@different_version/dist/bundle/module.js"
  }
}
```
 
## Endpoints

### file system

Once the dev server is started it mirrors your file system. You can for example visit the default origin url (http://localhost:<port>/) and it will match the current working directory. You should then be able to navigate through your project.

Often you can pass parameters or options to a specific endpoint thanks to query parameters.

### source files

If you visit a source file (.js) you will see the source code. However while serving source files, zora-dev-server may transform on the fly import statements to point to an actual source file so the browser won't see a package's name but an actual URL.
You can see the raw file if you wish by appending ``?format=raw`` to the URL 

### test files

If a source file is actually a test file you want to run, you can replace the extension name (.js) by ``.test``.

For example if you have a test file at ``cwd/test/my_test.js`` which respects the default export convention you can run those tests in the browser by visiting the url ``http://localhost:<port>/test/my_test.test`` 

### test runners

If you wish to run multiple test files at the same time (matching glob patterns), you can use a special endpoint.

// todo isolation with iframe if necessary

tip: zora-dev-server comes with a *test runner* which aims at simplifying your experience but zora alone is also pretty easy to use for browser testing. 

Just drop in an html file
```html
<script type="module">
import {test} from 'path/to/zora.js'; // or simply 'zora' if you serve the file with zora-dev-server
import spec from 'path/to/file';

test(`my test`, spec);
</script>
<script type="module">
import {test} from 'path/to/zora.js'; // or simply 'zora' if you serve the file with zora-dev-server
import spec from 'path/to/other/file';

test(`my ohter test`, spec);
</script>
<!--etc-->
```
And that's it! 

And if you don't use the convention of the default export and import zora directly in your test file, it's even easier: you just need to import the test file nothing more:

```javascript
// test.js
import {test} from 'path/to/zora.js' // or simply 'zora' if you serve the file with zora-dev-server

test('some test', t=> {
    t.eq('foo','bar')
});
```

```html
<script type="module" src="test.js"/>
```
## reporters

By default you will see a micro app with a summary of the tests (that is the [summary-app](#summary-app) reporter). But you will have in the console more details, stack traces, etc to troubleshoot your failing tests (that is the [console](#console) reporter).
If for some reason you wish to change the reporter, you can use the query parameters ``reporter``. You can have at the same time two reporters. This may be useful if you want to have something in the browser and pass info at the same time with the devTool protocol (through console calls) or a network protocol (websocket etc).

example: ``http://localhost:<port>/some/test.test?reporter=tap&reporter=summary-app``

### summary-app

// todo

### console

// todo

### tap

// todo

### tap-indent

// todo

## Log

By default zora-dev-server is silent. But it uses the [debug]() package. So if you wish to have more info on entering requests or thrown errors you can start zora dev server with 
the DEBUG env variable set to ``zora-dev-server:*``.

## Caching

The browser comes with a variety of caches. zora-dev-server tries to take advantage of it to be the fastest as possible. You should probably not deactivate the caches while developing, if a file is changed it will be detected.
However, once you want to swap to another project we recommend to purge the caches especially if you use the same port.
 
## As part of CI

// todo puppeteer

// idea web socket (like karma ?)

## Security

The server is meant for development purpose and is not in any way a secure server you would want to expose to the network. 

## icons

The icons used are from the awesome [icomoon application](https://icomoon.io)