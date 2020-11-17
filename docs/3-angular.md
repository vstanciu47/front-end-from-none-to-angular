# [Front-end from none to Angular](../README.md)

## 3. Angular (1/2)

- [Prerequisites](#Prerequisites)
- [Angular CLI](#Angular-CLI)
- [Routing, feature modules, routing modules](#Routing-feature-modules-routing-modules) + [Exercise](#Exercise-routing)
- [Binding](#Binding)
- [Services](#Services) + [Exercise](#Exercise-services)
- [Proxies](#Proxies)
- [Interceptors](#Interceptors) + [Exercise](#Exercise-interceptors)
- [Guards](#Guards) + [Exercise](#Exercise-guards)
- [Environments](#Environments) + [Exercise](#Exercise-environments)
- [Components](#Components)
- [Pipes](#Pipes) + [Exercise](#Exercise-pipes)
- [Directives](#Directives) + [Exercise](#Exercise-directives)

---

## Prerequisites

- [Node.js](https://nodejs.org/en/) - prefer LTS

---

## Angular CLI

- install [angular-cli](https://cli.angular.io/) globally `npm i -g @angular/cli`
- check if it is available globally `ng version`
- check how to use it `ng help`
- generate your first app (this creates a new folder) `ng new hub`
- inspect `package.json`, `tsconfig.json`, `tslint.json`, `angular.json`

---

## Routing, feature modules, routing modules

Let's generate some components (more about these below) to use for our routes

- 1st component, referenced in main module

```batch
cd src/app
ng generate component lock
```

add the component to routes array

```ts
{ path: "lock", component: LockComponent },
```

- 2nd component, contained in a feature module, referenced in main module

```batch
cd src/app
ng generate module apps
cd src/app/apps
ng generate component apps-page
```

import the feature module in `app-routing.module`

```ts
imports: [..., AppsModule, ...],
```

add the component to routes array

```ts
{ path: "apps", component: AppsPageComponent },
```

- 3rd component, contained in a router module, lazy loaded (not referenced directly)

```batch
cd src/app
ng generate module get --route get --module app.module
```

this does all the hard work for us, including adding the component to routes array

- finish off the routes with a "catch-all" route

```ts
{ path: "**", redirectTo: "apps" },
```

- clean up `app.component.html`

```html
<div>
    <a href="apps">Apps</a> &nbsp;
    <a routerLink="get">Get</a> &nbsp;
    <a href="#lock">Lock</a> &nbsp;
</div>

<router-outlet></router-outlet>
```

- could enable hash navigation, to ensure deep linking works out of the box with all possible servers

```ts
imports: [..., RouterModule.forRoot(..., { useHash: true }), ...],
```

### Exercise-routing

- figure out why one of the links causes refresh in browser  
- figure out why one of the links does not work without hash navigation enabled  
- figure out which works in all scenarios and does not cause refresh  

---

## Binding

### Unidirectional

Add a new prop in `apps-page.component`

- in `.ts`

```ts
pageName = 'Hub apps page'
```

- in `.html`

```html
<h1>{{pageName}}</h1>
```

That's it! a prop in the controller can be displayed in the template using interpolation syntax `{{...}}`

### Biidirectional

How about updating the value both ways (from template to controller)? We use `ngModel`!
This new directive comes from `FormsModule` module, so lets's import it first in `apps.module.ts`

```ts
import { FormsModule } from "@angular/forms";

@NgModule({
    ...
    imports: [ ... FormsModule ... ],
    ...
})
export class AppsModule { }
```

Now we can use it; in `apps-page.component.html` add an input box:

```html
<input type="text" [(ngModel)]="pageName" />
```

Now type anything in the box and see how it changes the prop value and then the template! Simple!
Did you notice the weird syntax `[(ngModel)]`? It's both a "value in" `[]` as well as an event `()`

---

## Services

- Services are "any" reusable classes that benefit from angular's DI system.

- Add a service to contain the logic for apps data to display:

```batch
cd src/app/apps
ng generate service apps
```

- open the newly created service and change

```ts
@Injectable({
    providedIn: 'root'
})
```

to `@Injectable()`; we want this service to be a part of the `apps` module (because it is specialized for aiding the display of apps so far), so that we can later lazy load it with all it's dependencies if we need

- make `apps.module` be the (one and only) provider for this service

```ts
import { AppsService } from "./apps.service";

@NgModule({
    ...
    providers: [AppsService]
    ...
})
export class AppsModule { }
```

- add a service method to return some hardcoded data (also export an interface for it too); we use a promise to make it async

```ts
export interface Launcher {
    id: number;
    name: string;
}

@Injectable()
export class AppsService {
    ...
    getApps(): Promise<Launcher[]> {
        return Promise.resolve([
            { id: 1, name: "app 1" },
            { id: 2, name: "app 2" },
            { id: 3, name: "app 3" },
    ]);
    }
    ...
```

- now let's consume it:
  - import it in `apps-page.component.ts` and add it to the constructor (as private, we do not intend to expose the injected instance)

```ts
import { AppsService } from '../apps.service';
...
export class AppsPageComponent implements OnInit {
    constructor(
        private appsService: AppsService
    ) { }
```

- add a new prop and initialize it with an asunc call to the service

```ts
    launchers = new Array<Launcher>();
    ngOnInit(): void {
        this.appsService.getApps().then(apps => this.launchers = apps);
    }
```

- and finally let's display them; in `apps-page.component.html`

```html
<p *ngFor="let launcher of launchers">{{launcher.name}}</p>
```

we're using the "structural directive" `*ngFor` to iterate the array using js-like syntax, naming the current instance and then using it in the one-way binding interpolation to show the app name

### Exercise services

- create a `mocks` folder beside `src` folder and move the fake data to `mocks/db.json`

```json
{
    "apps": [
    { "id": 1, "name": "app 1" },
    { "id": 2, "name": "app 2" },
    { "id": 3, "name": "app 3" },
    ]
}
```

- install a dev json server [`npm install -g json-server`](https://github.com/typicode/json-server)

- start the dev json server `json-server --watch db.json`

- update the service to make a GET http call to `http://localhost:3000/apps`

```ts
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AppsService {
    constructor(private http: HttpClient) { }

    getApps(): Promise<Launcher[]> {
        return this.http.get<Launcher[]>('http://localhost:3000/apps').toPromise();
    }
}
```

- in browser, inspect the response headers for `/apps`; notice the custom `x-powered-by: ...` header; the json server is based on that framework :)

---

## Proxies

We added a service in previous section and we hardcoded it's full URL.  
In development, we can't serve the app and external services under the same port.  
In production, this service is most likely to be hosted by the same process that servers this angular app.  
For these cases, we can set up `ng serve` to divert some URLs to other services

- save the following config to `src/proxy.conf.json`

```json
{
    "/apps": {
        "target": "http://localhost:3000/apps",
        "secure": false
    }
}
```

- in `angular.json`, add prop `"proxyConfig": "src/proxy.conf.json"` to section `architect.serve.options`
- change the URL in `AppsService.getApps()` from `http://localhost:3000/apps` to `/apps`
- restart `ng serve` command; app should work as before, but now it does not contain any hardcoded paths that may be irelevant in production

---

## Interceptors

Interceptors are middleware functions that "catch" `http` requests (or responses) and modify them if needed.  
A common use-case for them is the addition of auth headers for protected resources.  
Another use case is the interception of `401` responses and redirect to login.  

Let's pretend we are using authorization and we want to append a bearer token header to requests to `/apps` route.  

- so far, only the `apps` module makes api requests, so we'll add the interceptor in this module

```batch
cd src/app/apps
ng generate interceptor bearer-header
```

- to make the module use it, provide it:

```ts
@NgModule({
    ...
    providers: [
        ...
        { provide: HTTP_INTERCEPTORS, useClass: BearerHeaderInterceptor, multi: true },
        ...
    ],
    ...
})
export class AppsModule { }
```

- by default, interceptors are set to pass the requests through `return next.handle(request);`; change the logic to conditionally chnange them

```ts
intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.toLowerCase().startsWith("/apps")) {
        const token = Date.now(); // pretend we get a token from memory or session
        request = request.clone({ headers: request.headers.append("Authorization", `Bearer ${token}`) })
    }

    return next.handle(request);
}
```

Did I say *change* the requests? Well, we can't really do that, the request object is readonly, but we can `clone` requests, update the clone then *replace* the original request object with our modified clone

- inspect the network tab in browser and look for `/apps` request; you should see `Authorization: Bearer ...` in the request headers list

### Exercise interceptors

- try to create a new interceptor to alter the response body, for example filter out the apps array based on some logic (e.g. filter %2 ids based on Math.random() > 0.5 condition)

---

## Guards

Guards are boolean-like evaluated functions that decide if routes can be loaded or otherwise activated (displayed).  
In extension, they can also be used to perform "deactivate" checks, so that a route cannot be left unless the condition is true.  
Let's add a route guard to protect apps page from being displayed if authorization is not present. For this, we will redirect to a "login" page

- create a (fake) login page in the main module

```batch
cd src/app
ng generate component login
```

and add some info in its template `src/app/login/login.component.html`

```html
<p>this is a fake login page to redirect to when app is not authorized</p>
<a routerLink="/apps">click here to pretend to login and go to apps page</a>
```

and of course add the new route to `app-routing.module.ts`

```ts
{ path: "login", component: LoginComponent },
{ path: "**", redirectTo: "apps" },
```

- create an auth guard in main module

```batch
cd src/app
ng generate guard auth
```

and add some awesome logic (pretend we're checking the existence and validity of a token) in `src/app/auth.guard.ts`

```ts
private hasValidToken = false;

constructor(
    private router: Router
) { }

canActivate(...): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.hasValidToken)
        return this.router.navigateByUrl("/login")
            .then(() => this.hasValidToken = true)
            .then(() => false);

    return true;
}
```

- and now let's protect the `apps` route in `src/app/auth.guard.ts`

```ts
{ path: "apps", component: AppsPageComponent, canActivate: [AuthGuard] },
```

### Exercise guards

- try to protect the lazy loaded module from being downloaded using `canLoad` in a new guard (use any random condition)

---

## Environments

Environment files are angular's equivalent of an app.config from .NET  
In this app, we've hardcoded the routes all over the place; they could be saved in a single file  
We could of course have some logic to create some statically available resources before the app itself is initialized, or we can use the env files  
Throughout the app, only ever import `environment.ts`, never the "prod" or "staging" or whatever envs the app has defined  
This is because the specific env file overwrites the `environment.ts` file wehn the app is built for that specific env  

### Exercise environments

- hardcoding routes is a common "mistake" that devs do in angular apps; let's fix this
- create a base env file export a routes object

```ts
export const routes = {
    lock: "lock",
    apps: "apps",
    get: "get",
    login: "login"
}
```

- reexport this file in all env files (`environment.ts`, `environment.prod.ts`, etc)

```ts
export { routes } from "./env";
```

- import `environment.ts` in all files that reference routes and use them from the file (below is an example for `app-routing.module.ts`)

```ts
import { routes as routeDef } from "../environments/environment";

const routes: Routes = [
    { path: routeDef.lock, component: LockComponent },
    ...
```

- to verify you got all, rename all routes and check if app still works (pay extra atention to places where router is used programatically - this is a code smell, in case you missed it)
- do your `<a routerLink="...">` still work? for those, you need to provide props in the controllers, otherwise they'll remain hardcoded in html, which defeats the purpose

---

## Components

We've already used components before, because so far "we had to".
It is time to explain what they are good for: organizing code specialized for rendering purposes.
The apps page is now responsible for rendering itself as well as rendering multiple apps; it's not so hard to imagine that these apps will have to contain a lot of user interaction logic as well as styles and markup that have little to do with the apps page flow and elements (e.g. title), so it's better to contain the launcher logic in a separate component.

- Add a new `launcher` component

```batch
cd src/app/apps
ng generate component launcher
```

- Open and inspect the created file `launcher.component.ts`; the component received a custom html selector name `app-launcher`

- The new component will receive the data using `@Input()` decorator and send back data using `@Output()`; add the following props and methods to it

```ts
@Input()
obj: Launcher

@Output()
clicked = new EventEmitter<number>();

noOfClicks = 0;

click() {
    this.noOfClicks++;
    console.log(this.obj.id, this.noOfClicks);
    this.clicked.emit(this.noOfClicks);
}
```

- replace it's template with `<p (click)="click()">{{obj.name}}</p>`

- replace the repeater from `apps-page.component.html` and use the new component instead

```html
<app-launcher *ngFor="let launcher of launchers"
              [obj]="launcher"
              (clicked)="clickedHappenned($event)">
</app-launcher>
```

- in `apps-page.component.ts` add a listner for events emitted from the laucher component

```ts
clickedHappenned($event: number) {
    console.log("parent: ", $event);
}
```

---

## Pipes

Pipes are simple functions that transform the input and render the output instead.  
We want to display the app names prefixed with "web" or "desktop" (chosen randomely)

- generate a new pipe

```batch
cd src/app/apps
ng generate pipe nameit
```

- update `launcher.component.html`

```html
<p (click)="click()">{{obj.name | nameit}}</p>
```

- update `nameit.pipe.ts` to make it return the input value unchanged

```ts
transform(value: string): string {
    return value;
}
```

### Exercise pipes

- update the logic to return the app names prefixed with "web" or "desktop" (chosen randomely); add more fake data to `db.json` to make it more relevant

---

## Directives

An Attribute directive changes the appearance or behavior of a DOM element.  
There are 2 types of directives: attribute and structural.  
We've already used built-in structural directive (`*ngFor`); these modify the DOM.
Attribute directives change the appearance of elements.

### Exercise directives

- create an attribute directive that displays the "web" and "desktop" apps differently; use delayed execution (with `setTimeout`) to allow the elem to be init
- create a structural directive that does almost the same thing as the `nameit` pipe, but add a suffix also (random); use delayed execution (with `setTimeout`) to allow the elem to be init
