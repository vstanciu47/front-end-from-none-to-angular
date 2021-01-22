# [Front-end from none to Angular](../README.md)

## 3. Angular (1/3)

- [Prerequisites](#prerequisites)

- [Angular CLI](#angular-cli)
- [Routing, feature modules, routing modules](#routing-feature-modules-routing-modules)
- [Binding](#binding)
- [Exercise](#exercise)

- [Next](#next)

---

## Prerequisites

- [Node.js](https://nodejs.org/en/) - prefer LTS
- [Angular Language Service VS Code extension](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)

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

To do:

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

## Exercise

- [Angular: The Big Picture](https://app.pluralsight.com/library/courses/ng-big-picture) - 1h 7m
- [Angular Routing](https://app.pluralsight.com/library/courses/angular-routing) - 4h 49m

---

## Next

[Angular (2/3)](4-angular.md)
