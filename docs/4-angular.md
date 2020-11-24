# [Front-end from none to Angular](../README.md)

## 4. Angular (2/3)

- [Prerequisites](#prerequisites)

- [Services](#services)
- [Proxies](#proxies)
- [Interceptors](#interceptors)
- [Guards](#guards)
- [Exercises](#exercises)

- [Next](#next)

---

## Prerequisites

- [Node.js](https://nodejs.org/en/) - prefer LTS
- [JWT inspector Chrome extension](https://bugjam.github.io/jwt-inspector/)
- [Angular Language Service VS Code extension](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)

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
            { id: 4, name: "app 4" },
            { id: 5, name: "app 5" },
            { id: 6, name: "app 6" },
            { id: 7, name: "app 7" },
            { id: 8, name: "app 8" },
            { id: 9, name: "app 9" },
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
        this.appsService.getApps().then(launchers => this.launchers = launchers);
    }
```

- and finally let's display them; in `apps-page.component.html`

```html
<ul>
    <li *ngFor="let launcher of launchers">{{launcher.name}}</li>
</ul>
```

we're using the "structural directive" `*ngFor` to iterate the array using js-like syntax, naming the current instance and then using it in the one-way binding interpolation to show the app name (more about directives later)

---

## Proxies

We added a service in previous section and we hardcoded it's full URL.  
In development, we can't serve the app and external services under the same port.  
In production, this service is most likely to be hosted by the same process that servers this angular app.  
For these cases, we can set up interal dev server `ng serve` to divert some URLs to other services

### External mock server

- move the apps array from `apps.service.ts` to a new json file `src/mocks/db.json`

```json
{
    "apps": [
        { "id": 1, "name": "app 1" },
        { "id": 2, "name": "app 2" },
        ...
    ]
}
```

- install a dev json server [`npm install -g json-server`](https://github.com/typicode/json-server)

- the dev json server can be started with `json-server --watch src/mocks/db.json`

- to make it easier to run it when we start the app, add a new script in `package.json`

```json
{
    "scripts": {
        "db-mock": "json-server --watch src/mocks/db.json",
    }
}
```

and update the start script

```json
{
    "scripts": {
       "start": "start npm run db-mock & ng serve",
    }
}
```

Now stop the ng app and run `npm start`; both the app and the mock server will restart when changes are detected.

- update the service to make a GET http call to `http://localhost:3000/apps`

```ts
import { HttpClient } from "@angular/common/http";

@Injectable()
export class AppsService {
    constructor(private http: HttpClient) { }

    getApps(): Promise<Launcher[]> {
        return this.http.get<Launcher[]>('http://localhost:3000/apps')
            .toPromise();
    }
}
```

In the snipet above, we are importing a new built-in component, the `HttpClient`; this part of `HttpClientModule`, so let's declare it in our `apps.module.ts`

```typescript
import { HttpClientModule } from "@angular/common/http";

@NgModule({
    ...
    imports: [..., HttpClientModule],
    ...
})
export class AppsModule { }
```

- in browser, inspect the response headers for `/apps`; notice the custom `x-powered-by: ...` header; the json server is based on that framework :)

### Proxy requests to external mock server

- save the following config to `src/proxy.conf.json`

```json
{
    "/apps": {
        "target": "http://localhost:3000",
        "secure": false
    }
}
```

- in `angular.json`, add prop `"proxyConfig": "src/proxy.conf.json"` to section `architect.serve.options`
- change the URL in `AppsService.getApps()` from `http://localhost:3000/apps` to `/apps`
- restart `ng serve` command; app should work as before, but now it does not contain any hardcoded paths that may be irelevant in production
- note that if you didn't stop the mock server as well, this script will fail as it cannot bind to the same port again

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

- by default, interceptors are set to pass the requests through `return next.handle(request);`; update the logic to conditionally change the requests

```ts
intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.toLowerCase().startsWith("/apps")) {
        // create a fake JWT token (this would normally be received from oauth server)
        const token = `fake.jwt.token`;

        // read the token from memory/storage and append it to request auth header
        request = request.clone({
            headers: request.headers.append("Authorization", `Bearer ${token}`)
        });
    }

    return next.handle(request);
}
```

Did I say *change* the requests? Well, we can't really do that, the request object is readonly, but we can `clone` requests, update the clone then *replace* the original request object with our modified clone

- inspect the network tab in browser and look for `/apps` request; you should see `Authorization: Bearer ...` in the request headers list

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

- add the new route to `app-routing.module.ts`

```ts
{ path: "login", component: LoginComponent },
{ path: "**", redirectTo: "apps" },
```

- create an auth guard in main module

```batch
cd src/app
ng generate guard auth
```

add logic in `src/app/auth.guard.ts` to check if a token exists

```ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router
    ) { }

    canActivate(): boolean | Promise<boolean> {
        return this.hasValidToken()
            ? true
            : this.router.navigateByUrl('login').then(() => false);
    }

    private hasValidToken(): boolean {
        const token = window.sessionStorage.getItem("token");
        return token !== null;
    }
}
```

- protect the `apps` route in `src/app/auth.guard.ts` with this guard

```ts
{ path: "apps", component: AppsPageComponent, canActivate: [AuthGuard] },
```

- try to navigate to apps page => it displays the login component

- update `login.component.html` (add a "user" field and a "login" button on the login page)

```html
<input type="text" [(ngModel)]="userName">
<input type="button" (click)="login()" value="log in">
```

- import the `FormsModule` as before in the containing module of login page.

- declare `userName` as (empty) string prop in `login.component.ts`

- create a fake `login()` method in `login.component.ts`; also set the token to sessionStorage; at the end, should redirect back to the original URL, but since we didn't pass it to this page, we'll just hardcode redirect to `apps`

```ts
login() {
    if (!this.userName) return;

    // create a fake JWT token (in a real world scenario this is received from oauth server)
    const header = {
        header: "header"
    };
    const payload = {
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000),
        exp: Math.floor(new Date(Date.now() + 5 * 1000).getTime() / 1000), // 5 seconds validity
        sub: this.userName // the user id will be bound to this field in a real world scenario
    };
    const signature = "signature";

    const encode = (obj: Object) => btoa(JSON.stringify(obj)).replace(/=+$/g, "");

    const token = `${encode(header)}.${encode(payload)}.${encode(signature)}`;
    window.sessionStorage.setItem("token", token);

    this.router.navigateByUrl(`apps`);
}
```

- remove the fake token from `BearerHeaderInterceptor`, replace it with a read from sessionStorage

```typescript
const token = sessionStorage.getItem("token");
```

- now retry the full flow in browser: go to apps, (auto) redirect to login, (auto) redirect back to apps

- check out the network call to `apps`, notice the `Authorization` header

- if you installed the JWT Chrome extension mentioned in [prerequisites](#prerequisites), switch to it to see the decoded token

- if not, copy the value of the token (whatever follows after `Bearer` and paste it on [JWT.io](https://jwt.io/)) to see the decoded token

---

## Exercises

### Exercise 1: validate token in auth guard

In the auth guard we're returning "true" if there is something in storage with key "token".  
This is useless, we should validate the token and return the validation result instead.  
Modify the logic in `hasValidToken` to return true if the token exists, the current time is between `nbf` and `exp` and also if the `sub` is a certain value (let's say "admin").  
If any of that is false, redirect to login.

### Exercise 2: watch for 401 responses

Create a new interceptor to monitor "401" response status code and redirect to login page if so.  
Use the snipet below and try to fix the missing imports and understand what is going on.

```typescript
intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // this doesn't touch the request object, it only checks responses
    return next.handle(request).pipe( // "pipe" into the response
        catchError(error => {
            // check if response is 401
            if (error.status === 401)
                this.router.navigateByUrl(`login`); // navigate to login page

            // throw the error back to caller
            return throwError(error);
        })
    );
}
```

---

## Next

[Angular (3/3)](5-angular.md)
