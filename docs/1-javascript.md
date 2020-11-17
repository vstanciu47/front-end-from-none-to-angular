# [Front-end from none to Angular](../README.md)

## 1. Javascript

- [History](#History)
- [Usage](#Usage)
- [Modules](#Modules)
- [Specifics](#Specifics)
- [To do](#To-do)
- [Resources](#Resources)

---

## History

- 1995 - first lang specs created in 10 days (Sun, Netscape)
- 1996 - submitted to European Computer Manufacturers Association (ECMA) for standardization
  - Yahoo, Microsoft, Google, Mozilla, ...
  - Technical Comitee 39 ([TC39](https://tc39.es/))
- 1997 - ECMAscript 1 (ES1)
- 1998 - ES2 - std
- 1999 - ES3 - regex, try/catch
- 2003 - ES4*
  - abandoned; Microsoft vs Mozilla; breaking changes
  - classes, module system, generators, iterators, destructuring
- 2006 - [jQuery](https://jquery.com/), $, $$
- 2008 - Chrome, V8 engine
- 2009 - ES5
  - subset of ES4, named ES3.1
  - json, reflection, get/set
- 2009 - Node.js, V8 engine
- 2010 - [AngularJs](https://angularjs.org/)
- 2011 - ES5.1 - std
- 2013 - [Vue.js](https://vuejs.org/)
- 2014 - [Angular](https://angular.io/) aka angular 2+
- 2015 - ES2015 (ES6)
  - 1 yr cadence, named releases
  - promises, classes, ES modules, generators, arrow functions, let/const, new collections (sets, maps, weakmaps), reflection, template literals
  - engines still don't support this 100%
  - transpiling to older supported features, polyfills, monkey patches
- 2016
  - ES2016 (ES7) - meh
  - [React](https://reactjs.org/), JSX (javascript XML)
- 2017 - ES2017 (ES8) - async/await, Object+
- 2018 - ES2018 (ES9) - rest operator, promise.finally
- 2019 - ES2019 (ES10) - Array+, Object+
- 2020 - ES2020 (ES10) - BigInt, ??

[ES.Next living spec](https://github.com/tc39/proposals/blob/master/finished-proposals.md)

---

## Usage

### In browser

Save this as `index.html` and run in a browser

```html
<!-- inline js, "sync" -->
<script>
    var something = 42;
    window.something++; // ++something; // something = something + 1; // something += 1; //
    console.log(something); // what will this log?
</script>
```

To see if it worked, open developer console (F12)  
Now move the js to a new file `def.js` and change the import in `index.html`

```html
<!-- http request, "async" -->
<script src="def.js"></script>
```

### In Node.js

Now let's run the js in node; open a console/terminal and run `node def.js` (or just `node def`)

! There's no global "window" object; comment it and try again

! Does the file still work in browser?

---

## Modules

### Modules in browser

Let's add two new js files

```javascript
// add.js
function v1() { something++; } // function declaration
var v2 = function add_v2() { something++; } // named function expression
var v3 = function () { something++; } // anonymous function expression
/* var */ const v4 = () => something++; // lambda function // ES6+ !! (no IE)
```

```javascript
// run.js
var arr = [v1, v2, v3, v4]; // new Array(v1, v2, v3, v4);
var rnd = Math.floor(Math.random() * (arr.length - 1));
var rnd_add_v = arr[rnd];
rnd_add_v();
console.log(something);
```

To use it in html, we have to add it

```html
<script src="def.js"></script>
<script src="run.js"></script>
<script src="add.js"></script>
```

! Does it work?

! What if we had 42 files? Would you want to maintain this list?

Let's make all js contained in ES modules, rather than poluting the global scope  
! ES modules only work in ES6+ browsers (again, no IE)  

- `def.js`
  - export the var `export var something; // exports an obj like { something: something } // export default var something`
- `add.js`
  - import the var first `import { something } from "./def"; // destructure import object // ! destructure arrays // tuple++`
  - export all 4 functions  `export ...`
- `run.js`
  - import the (ex global) var from def `import { something } from "./def";`
  - import all exported objects under a new named object reference `import * as adds from "./add"; // named import object`
  - hint: `var arr = Object.values(adds);`
- `index.html`
  - only import `run.js` as `module` like this `<script type="module" src="run.js"></script>`

! ES modules use CORS, so this won't work with `file://` protocol anymore

- use a file server `npx http-server .`

- fix imports `.js`, the IDE knows it is implicit but browser doesn't, it makes a http request and can't imply it

! exports are readonly outside modules, to prevent side effects; make the functions pure (pass arg, return ++arg)

! for backward compatibility, these have to be transpiled

! for backward compatibility, we could use libs like [RequireJS](https://requirejs.org/), [SystemJS](https://github.com/systemjs/systemjs), etc; these wrap every file in named functions to control import/export, but this is too verbose and sort of obsolete nowadays

### Modules in Node.js

Try it again `node run.js`; if it doesn't, there are options:

- use [node v15+](https://nodejs.org/docs/latest-v15.x/api/esm.html#esm_enabling)
  - rename `.js` to `.mjs` throughout and do any of these:
  - install node v15+ (but make sure you revert back to current LTS)
  - use [nvm for Windows](https://github.com/coreybutler/nvm-windows) to switch easily to v15
  - use `docker run --rm -v %cd%:/fe -w /fe node:alpine node run.mjs`
- rewrite as CommonJS

```javascript
// def.js
exports.something = something;

// add.js
exports.v1 = ...

// run.js
var adds = require("./add.js");
var { something } = require("./def.js");
```

- transpile to CommonJS using libs like [babel](https://babeljs.io/) or even [tsc --allowJs](https://www.typescriptlang.org/tsconfig)

---

## Specifics

Save this as `specs.js` and import it in `index.html`

```javascript
document.body.innerHTML =
    "<table>" +
    [
        `.1 + .2`, `.1 + .3`, `1 + "2"`, `1 + Number("2")`, `1 + +"2"`, `1 + parseInt("2", 10)`,
        `1 + +" 2"`, `1 + +"x 2"`, `typeof 2`, `typeof "2"`, `typeof NaN`, `isNaN(+"x 2")`, `isNaN(+" 2")`,
        `typeof Number(2)`, `typeof Number`, `typeof new Number(2)`, `2 instanceof Number`,
        `Number(2) instanceof Number`, `new Number(2) instanceof Number`, `new Number(2) instanceof Object`,
        `Number instanceof Object`, `42 == 42`, `42 == "42"`, `42 === "42"`, `null || 42`,
        `undefined || 42`, `0 || 42`, `null ?? 42`, `undefined ?? 42`, `0 ?? 42`, `!!null`, `!!0`,
        `!!""`, `!!{}`, `"replace".replace("e", ".")`
    ].map(expression => ({
        key: expression,
        value: eval(expression) // do not use eval // eval is evil
    })).map(({key, value}, index) => {
        const tr = document.createElement("tr");

        const td = document.createElement("td");
        td.innerHTML = (index + 1) + "&nbsp;&nbsp;&nbsp;"; // .innerText // .textContent
        tr.appendChild(td);

        tr.innerHTML = tr.innerHTML + "<td><pre>" + key + "</pre></td>";

        tr.innerHTML += `<td>${value}</td>`;

        return tr.outerHTML;
    }).join("") +
    "</table>";
```

Add this to `specs.js`

```javascript
[...document.querySelectorAll("table tr > td:nth-child(2)")]
    .forEach(td => td.addEventListener("click",
        e => alert(e.target.innerText + "   =>   " + eval(e.target.innerText) /* do not use eval */)));
```

Run this in the console

```javascript
(() => eval(`console.log(thevar); var thevar = 42;`) /* do not use eval */)(); // IIFE
```

Run this in the console

```javascript
eval(`console.log(thelet); let thelet = 42;`); //do not use eval
```

---

## To do

- [Promises and Async Programming](https://app.pluralsight.com/library/courses/javascript-promises-async-programming/table-of-contents) - 1h 21m
- [Objects, Prototypes, and Classes](https://app.pluralsight.com/library/courses/javascript-objects-prototypes-classes/table-of-contents) - 1h 48m
- [Arrays and Collections](https://app.pluralsight.com/library/courses/javascript-arrays-collections/table-of-contents) - 1h 57m

Advanced topics

- "this" ([clip 1](https://app.pluralsight.com/course-player?clipId=7adec8f9-4941-4615-8437-b5d8e1531f86), [clip 2](https://app.pluralsight.com/course-player?clipId=53c096dc-dcc6-4d87-8702-cfccf30485d5), [clip 3](https://app.pluralsight.com/course-player?clipId=6b02dce7-41e9-4a92-9ebc-4cc162828256), [clip 4](https://app.pluralsight.com/course-player?clipId=e5a81c63-7e5c-46c1-932e-96468796a80c)) - 40m 29s
- [Generators and Iterators](ttps://app.pluralsight.com/library/courses/javascript-generators-iterators/table-of-contents) - 1h 25m
- [Proxies and Reflection](https://app.pluralsight.com/library/courses/javascript-proxies-reflection/table-of-contents) - 1h 27m

---

## Resources

- [W3C tutorials and courses](https://www.w3.org/2002/03/tutorials)
- [codesandbox](https://codesandbox.io/)
- [Chrome .md viewer](https://chrome.google.com/webstore/detail/markdown-preview-plus/)

---

[Next: modules 1-4 from NodeJs API for a .NET developer](https://code.waters.com/bitbucket/users/rovian/repos/nodejs-api-for-a-.net-developer/browse) workshop
