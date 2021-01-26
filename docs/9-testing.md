# [Front-end from none to Angular](../README.md)

## 9. Testing

- [Prerequisites](#prerequisites)

- [Reorganize](#reorganize)
- [Unit](#unit)
- [Integration](#integration)
- [Unit & integration tests in Docker](#unit-integration-tests-in-Docker)
- [System](#system)
- [System tests in Docker](#system-tests-in-docker)
- [Exercise](#exercise)

- [Next](#next)

---

## Prerequisites

same as [3-docker](3-docker.md) and [8-docker](8-docker.md)

---

## Reorganize

It starts to get crowded in `hub` folder, we have both `client` and our fake `server` and we'll add another folder to contain the new test project.  
So let's split the projects first:

- create `server` folder and move `mocks` folder and `dockerfile.server`
- rename `server/dockerfile.server` to `server/dockerfile`

- create `client` folder and move everything apart from `.dockerignore`, `.gitignore`, `docker-compose.yml`
- rename `client/dockerfile.client` to `client/dockerfile`
- edit `client/dockerfile` and replace all `COPY ./` with `COPY ./client/`; pay attention to lines 8 and 12, those are copying multiple files

- edit `docker-compose.yml`

```yaml
services:
  client:
    build:
      dockerfile: ./client/dockerfile

  server:
    build:
      dockerfile: ./server/dockerfile
    volumes:
      - ./server/mocks/db.json:/hub/mocks/db.json
```

- edit `.dockerignore`

```.dockerignore
**/dist
**/node_modules
**/.editorconfig
**/.gitignore
**/dockerfile
**/docker-compose.yml
```

- update `package.json` > `scripts` > `"json-server": "json-server --watch mocks/db.json --host 0.0.0.0"`

- verify it still works
  - `npm start` => ensure `http://localhost:4200` works
  - `docker-compose up --build` => ensure `http://localhost:4200` works

## Unit

### Client unit tests

`docker-compose build client` => enable `npm run test` step

### Server unit tests

`docker-compose build server` => would include something similar to `npm run test`, but we have a fake server, no point test it

---

## Integration

### Client integration tests

This should test whole modules (even the root module is possible).  
The only restriction is the use of external dependencies, which have to be mocked.  
In this example, we will test `apps.module`, just to demo mocking http calls.  

- in `src/app/apps/apps.module.ts`
  - move the object form `@NgModule({ ... })` decoration to `export const appsModule: NgModule = { ... }`
  - update the decoration with references to the const `@NgModule({ declarations: appsModule.declarations, ... })`

- create a new module spec file for apps module: `src/app/apps/apps.module.it.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppsPageComponent } from './apps-page/apps-page.component';
import { appsModule } from './apps.module';

fdescribe('AppsModule', () => {
  let component: AppsPageComponent;
  let fixture: ComponentFixture<AppsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: appsModule.declarations,
      imports: appsModule.imports,
      providers: appsModule.providers,
    }).compileComponents();

    fixture = TestBed.createComponent(AppsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => expect(component).toBeTruthy());
});
```

- start the test suite `ng test` => FAIL due to missing deps (ngrx); these are set in main module, so we have to declare them in the test module as well

- in `src/app/app.module.ts`
  - extract NgRx stuff into an exported const and update the local use in decorator:

```ts
export const ngrxImports: NgModule['imports'] = [
  StoreModule.forRoot({}, {}),
  EffectsModule.forRoot([]),
  !environment.production ? StoreDevtoolsModule.instrument() : [],
  StoreDevtoolsModule.instrument({
    name: 'Mini-Hub App DevTools',
    maxAge: 25,
    logOnly: environment.production,
  }),
];

@NgModule({
  imports: [BrowserModule, AppRoutingModule, FormsModule].concat(ngrxImports as any[])
})
```

- back in our test, import `ngrxImports` and concat it to the test module imports:

```ts
import { ngrxImports } from '../app.module';

TestBed.configureTestingModule({
  imports: new Array<any>()
    .concat(appsModule.imports)
    .concat(ngrxImports),
```

- save and check tests...it appears to be fine but still FAIL; open dev tools and check log: missing deps (router); this is also set in main module, so we need to do it in our test module too (without any actual routes, we're not testing routing)

```ts
TestBed.configureTestingModule({
  imports: ...
    .concat([RouterModule.forRoot([])])
```

- save and check tests...it appears to be fine but still FAIL; in console we see 2 http requests failed; so in our test module we have to intercept http calls and resolve with mocked values; let's add an interceptor (and fix imports):

```ts
const apps = [{ id: 1, name: 'app 1', typeId: 1 }];

const types = [{ id: 1, name: 'web' }];

@Injectable()
class HttpRequestInterceptorMock implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    switch (request.url) {
      case '/apps':
        return of(new HttpResponse({ status: 200, body: apps }));
      case '/types':
        return of(new HttpResponse({ status: 200, body: types }));
      default:
        return next.handle(request);
    }
  }
}
```

- and provide it as part of our test module:

```ts
TestBed.configureTestingModule({
  providers: new Array<any>()
    .concat([
      {
        provide: HTTP_INTERCEPTORS,
        useClass: HttpRequestInterceptorMock,
        multi: true,
      },
    ])
    .concat(appsModule.providers),
```

- save and check tests => SUCCESS! we can see the apps page with one app (we hardcoded it); a usefull check would be at least the number of displayed apps:

```ts
it('should show one app', () => {
  const html = <HTMLElement>fixture.nativeElement;
  const launchers = Array.prototype.slice.call(
    html.querySelectorAll('app-launcher')
  ) as HTMLElement[];
  expect(launchers.length).toEqual(1);
});
```

- of course, this is just a demo test; we should instrument the mock to return as many combinations as we need (404, 500, no types, no apps, 10000 apps, etc) to test the logic of the module

### Server integration tests

`docker-compose build server` => would include something similar to `npm run e2e`, but we have a fake server, no point test it

---

## Unit & integration tests in Docker

- `npm i -D puppeteer`
- in `karma.conf.js`

```ts
process.env.CHROME_BIN = require("puppeteer").executablePath();

module.exports = function (config) {
  config.set({
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
```

- in `package.json` > `scripts` > `"test": "ng test --watch=false" --browsers=ChromeHeadlessNoSandbox`
- `npm test` will now use a headless `Chromium` instance provided by `puppeteer` and can run in container
- update `client/dockerfile`

```dockerfile
FROM node:14.15.4
RUN apt update && \
    apt install -y apt-utils libx11-xcb1 libxtst6 libnss3 libxss1 libasound2 libatk-bridge2.0-0 libgtk-3-0 default-jre
```

- enable step `RUN npm run test`
- `docker-compose build client` => watch for test step run and log output

## System

- `mkdir test & cd test`
- `npm init -y`
- `npm i -D @types/node jasmine @types/jasmine protractor @types/protractor puppeteer @types/puppeteer ts-node-dev typescript`
- `tsc --init`
- create `env.ts`

```ts
export const env = Object.freeze({
  URL: e(process.env.URL) || "http://localhost:4200/",
  HEADLESS: (e(process.env.HEADLESS) || "true") === "true"
});

function e(val: string | undefined) { return typeof val !== "undefined" ? String(val).trim() : ""; }
```

- create `protractor.ts`

```ts
import { execSync } from "child_process";
import { executablePath } from "puppeteer";
import { Config } from "protractor";
import { env } from "./env";

process.env.CHROME_BIN = executablePath();

execSync("node node_modules/protractor/bin/webdriver-manager update", { stdio: "inherit" });

console.log(env);

export const config: Config = {
  framework: "jasmine",
  specs: ["./src/tests/**/*.test.ts"],
  allScriptsTimeout: 30 * 1000,
  capabilities: {
    browserName: "chrome",
    "goog:chromeOptions": {
      binary: process.env.CHROME_BIN,
      args: /* https://peter.sh/experiments/chromium-command-line-switches/ */[
        "--disable-gpu",
        "--no-sandbox",
        "--ignore-certificate-errors",
        "--disable-dev-shm-usage",
        "--enable-features=NetworkService"
      ]
        .concat(env.HEADLESS ? ["--headless"] : [])
    }
  },
};
```

- update `package.json` replace `test` script: `set HEADLESS=false & ts-node-dev node_modules/protractor/bin/protractor protractor.ts`

- `mkdir src & cd src & mkdir tests & mkdir helpers & cd ..`
- create a first test file `src/tests/apps-page.test.ts`

```ts
import { browser, by, element } from "protractor";
import { env } from "../../env";

// jasmine test suit
describe("apps-page", function () {
  // jasmine test hooks
  beforeAll(() => console.log("starting a test suite"));
  beforeEach(async () => await new Promise<void>(done => setTimeout(() => (console.log("starting a test"), done()), 3000)));
  afterEach(() => console.log("finished a test"));
  afterAll(() => console.log("finished a test suite"));

  // jasmine async test
  it("should show login", async () => {
    await browser.get(env.URL);
    const loginComponent = element(by.css("app-login"));
    expect(await loginComponent.isPresent()).toBe(true);
  });

  // jasmine sync test
  it("should show login - the wrong way to do it using protractor's implicit transformation to sync", () => {
    browser.get(env.URL);
    const loginComponent = element(by.css("app-login"));
    expect(<boolean><any>loginComponent.isPresent()).toBe(true);
  });
});
```

- check if app is app and running `http://localhost:4200`; if not, start it as usual (in docker) `docker-compose up --build`
- run the test `npm test` => SUCCESS
- you can disable the second test by replacing `it` with `xit`; you can disable an entire suit with `xdescribe`
- you can also `focus` tests by `fit` or `fdescribe` - this will only run the `f` tests ignoring the regular ones

## System tests in Docker

### Docker prerequisites

#### Docker 'bridge' network

In the docker workshop, in production subsection, we've set up two services `client` and `server` that are able to communicate between them.  
This was possible because docker asigned them to a default shared subnet.  
But we have to limit the communication between services; for this we use networks and group services under common networks.  
For our small solution, we only need one network that is used for client's needs to access the server.
Let's define one now, and add it to both services in `docker-compose.yml`:

```yaml
services:
  client:
    networks:
      - client

  server:
    networks:
      - client

networks:
  client:
    driver: bridge
```

The `driver: bridge` can be omitted, it is the default option; this basically puts the services under the same subnet.  
Now when we run `docker-compose up`, a network named `hub_client` is created and used.  
Did you notice that `networks` is an array? Well, every service can have as many networks as it needs; for example if `server` would need to communicate with a `db` service, then these two can do so using a separate network (so that `client` won't be able to communicate with `db`) - this is a security measure.

#### Docker 'host' network

The 'host' network driver puts the consuming service on the same network as the host.  
So far, if we want to access the `client` network (in browser) we can do so using `http://localhost:4200`; this is possible because the `client` service publishes port 4200, meaning it forwards the container's port to the host's port 4200.  
Let's start a new container and try to access this URL from it: `docker run --rm node:14.15.4 curl http://localhost:4200` => FAIL; that's because in the container, `localhost` is the container's localhost, not the host's.  
If we want to reach the host's `localhost`, we have to put the container on the host's network; we do this by using `--net host`.  
Let's try it again: `docker run --rm --net host node:14.15.4 curl http://localhost:4200` => SUCCESS.  

### Docker prototype

Let's ensure the test container can access the host's network just like a user would, same as we did in previous section:

- create `test/dockerfile`

```dockerfile
FROM node:14.15.4
RUN apt update && \
    apt install -y apt-utils libx11-xcb1 libxtst6 libnss3 libxss1 libasound2 libatk-bridge2.0-0 libgtk-3-0 default-jre
CMD curl http://localhost:4200
```

- create a new `docker-compose.test.yml` file beside the existing one

```yaml
version: "3.8"

services:
  test:
    container_name: "test"
    build:
      context: .
      dockerfile: ./test/dockerfile
    depends_on:
      - client
      - server
    network_mode: host
```

- start the extra `test` service: `docker-compose -f docker-compose.yml -f docker-compose.test.yml up --build test` => SUCCESS, it logs our app's index.html

### Docker test

By now you should have ALL the information necesary to move the local testing in Docker.  
See [exercise](#exercise) section, this is your graduation exersice :)

---

## Exercise

### unit testing

TBD

### system level testing

#### authorize helper

- create a helper `authorize.ts` that types in `admin` and presses `Log in` if form is shown, or doesn't do anything if not
- ensure the helper can be called repeatedly without errors

#### create one test per page

- create one test for each of the 3 pages (not including the login, we're still pretending this is an external page that we're not testing).
- each should verify that an element exists on the page.
- use `authorize.ts` helper in all test files in a `beforeAll` hook

#### replicate to docker

- delete the demo `CMD` line from `test/dockerfile` and add all necesary info to run tests in a container, exactly the same as they did locally
- hint: remove `set HEADLESS=false` part from test script from `package.json`, it will fail otherwise, can't have windows in Docker

---

## Next

it never ends :)
