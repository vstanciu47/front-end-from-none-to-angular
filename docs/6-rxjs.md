# [Front-end from none to Angular](../README.md)

## 6. RxJs

- [Assignment](#assignment)

- [Next](#next)

---

## Key concepts
Reactive Programming, Observer Pattern, Declarative vs Imperative, Functional Programming

---

## The RxJS library
- Part of the the Rx* family (Reactive Extensions)
- The JavaScript implementation of ReactiveX
- "best ideas" from the Observer pattern and functional programming

---

## Basic example 1
- Create a simple HTML file containing a reference to the latest version of RxJS

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/rxjs/6.6.3/rxjs.umd.min.js"></script>
```

- Add the necessary library components to scope

```js
const { Observable } = rxjs;
```

- Create a stream of apples that emits two apples to its observer(s) before it completes

```js
let appleStream = new Observable(appleObserver => {
    appleObserver.next('Apple 1');
    appleObserver.next('Apple 2');

    appleObserver.complete();
});
```

- Create one or more apple observers

```js
const appleObserver1 = {
    next: apple => console.log(`An apple was emitted ${apple}`),
    error: err => console.log('An error has occured'),
    complete: () => console.log('No more apples')
}
```

- Subscribe to the apple stream

```js
let subscription = appleStream.subscribe(appleObserver1);
```

- Redefine the stream using a creator function and subscribe once again

```js
const { of } = rxjs;
appleStream = of('Apple 1', 'Apple 2');
subscription = appleStream.subscribe(appleObserver1);
```

---

## Basic example 2
- Create a simple HTML file containing a reference to the latest version of RxJS and a button

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/rxjs/6.6.3/rxjs.umd.min.js"></script>
<button id="myButton">Test</button>
```

- Add the necessary library components to scope

```js
const { Observable, fromEvent } = rxjs;
```

- Create an Observable from the button's click event

```js
const button = document.getElementById('myButton');
const myObservable = fromEvent(button, 'click');
```

- Subscribe to the newly created observable and click the button

```js
let subscription = myObservable.subscribe(event => console.log(event)); // clicking the button would now logs de event
```

- Unsubscribe from the stream and click the button

```js
subscription.unsubscribe(); // clicking the button does nothing now
```

---

## Assignment

- Functional programming in JavaScript: http://reactivex.io/learnrx/
- Counter feature refactor using Observables
- Hub app enhancement: add a launcher type filter without imperative code

--Hints:
- A dedicated endpoint for launcher types needs to be created for feeding the types dropdown
- Avoid redundancy by normalizing the launcher/type relationship; add a type_id (FK) on the launcher interface to achieve this
- Use an appropriate operator to merge launcher data with type data and correctly fill the launcher.type information
- Avoid calling the types' endpoint more than once by using an operator that enables caching of previous emmited values

Reference: DeborahK's RxJS course - https://github.com/DeborahK/Angular-RxJS & https://app.pluralsight.com/library/courses/rxjs-angular-reactive-development/table-of-contents

---

## Next

[NgRx](7-ngrx.md)
