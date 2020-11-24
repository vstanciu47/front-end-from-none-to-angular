# [Front-end from none to Angular](../README.md)

## 5. Angular (3/3)

- [Prerequisites](#prerequisites)

- [Components](#components)
- [Pipes](#pipes)
- [Directives](#directives)
- [Environments](#environments)
- [Exercises](#exercises)

- [Next](#next)

---

## Prerequisites

- [Node.js](https://nodejs.org/en/) - prefer LTS
- [JWT inspector Chrome extension](https://bugjam.github.io/jwt-inspector/)
- [Angular Language Service VS Code extension](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)

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

---

## Directives

An Attribute directive changes the appearance or behavior of a DOM element.  
There are 2 types of directives: attribute and structural.  
We've already used built-in structural directive (`*ngFor`); these modify the DOM.
Attribute directives change the appearance of elements.

---

## Environments

Environment files are angular's equivalent of an app.config from .NET  
In this app, we've hardcoded the routes all over the place; they could be saved in a single file  
We could of course have some logic to create some statically available resources before the app itself is initialized, or we can use the env files  
Throughout the app, only ever import `environment.ts`, never the "prod" or "staging" or whatever envs the app has defined  
This is because the specific env file overwrites the `environment.ts` file wehn the app is built for that specific env  

## Exercises

### Exercise 1: pipes

- update the logic to return the app names prefixed with "web" or "desktop" (chosen randomely); add more fake data to `db.json` to make it more relevant

### Exercise 2: directives

- create an attribute directive that displays the "web" and "desktop" apps differently; use delayed execution (with `setTimeout`) to allow the elem to be init
- create a structural directive that does almost the same thing as the `nameit` pipe, but add a suffix also (random); use delayed execution (with `setTimeout`) to allow the elem to be init

### Exercise 3: environments

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

## Next

[RxJs](6-rxjs)
