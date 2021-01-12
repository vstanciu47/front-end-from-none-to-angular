# [Front-end from none to Angular](../README.md)

## 7. NgRx

- [Installation](#installation)

- [State](#state)

- [Actions](#actions)

- [Reducer](#reducer)

- [Effects](#effects)

- [Dev Tools (Optional)](#dev-tools-optional)

- [Dispatching actions](#dispatching-actions)

- [Selecting data](#selecting-data)

- [Exercise](#exercise)

- [Next](#next)

---

## Installation

- Use the generator for adding the app store. Notice the `app.module` being updated

```batch
ng add @ngrx/store
```

- Under the project root, create a `state` folder and an `app.state.ts` file containing the app general state

```ts
export interface State {
}
```

- Add a feature store initialization to the `apps.module`

```ts
import { StoreModule } from '@ngrx/store'
```

```ts
@NgModule({
    ...
    imports: [
        ...
        StoreModule.forFeature('apps', {})
    ]
    ...
})
```

---

## State

- Create a folder named `state` under the `apps` feature folder

- Within the `state` folder, create an `index.ts` file that defines this specific slice of state

```ts
import { createFeatureSelector } from '@ngrx/store';
import * as fromRoot from '../../state/app.state';
import { AppType, Launcher } from '../apps.service';

export interface AppsState {
    apps: Launcher[],
    types: AppType[],
    selectedTypeId: number,
    error: string
}

export interface State extends fromRoot.State {
  apps: AppsState;
}

// Selector functions
const getAppsFeatureState = createFeatureSelector<AppsState>(
  'apps'
);
```

---

## Actions

- Within the same `state` folder in the `apps` feature folder, create an `apps.actions.ts` file that defines the actions we intend to support

```ts
/* NgRx */
import { Action } from '@ngrx/store';
import { AppType, Launcher } from '../apps.service';

export enum AppsActionTypes {
    LOAD_APPS = '[APPS] Load apps',
    LOAD_APPS_SUCCESS = '[APPS] Loaded apps successfully',
    LOAD_APPS_FAILURE = '[APPS] Failed to load apps',
    LOAD_TYPES = '[APPS] Load app types',
    LOAD_TYPES_SUCCESS = '[APPS] Load app types successfully',
    LOAD_TYPES_FAILURE = '[APPS] Failed to load app types',
    SELECT_TYPE = '[APPS] Selected a specific app type'
}

// Action Creators
export class LoadApps implements Action {
  readonly type = AppsActionTypes.LOAD_APPS;
}

export class LoadAppsSuccess implements Action {
  readonly type = AppsActionTypes.LOAD_APPS_SUCCESS;
  constructor(public payload: Launcher[]) {}
}

export class LoadAppsFail implements Action {
  readonly type = AppsActionTypes.LOAD_APPS_FAILURE;
  constructor(public payload: string) {}
}

export class LoadTypes implements Action {
    readonly type = AppsActionTypes.LOAD_TYPES;
}
  
export class LoadTypesSucess implements Action {
  readonly type = AppsActionTypes.LOAD_TYPES_SUCCESS;
  constructor(public payload: AppType[]) {}
}
  
export class LoadTypesFail implements Action {
  readonly type = AppsActionTypes.LOAD_TYPES_FAILURE;
  constructor(public payload: string) {}
}

export class SelectType implements Action {
    readonly type = AppsActionTypes.SELECT_TYPE;
    constructor(public payload: number) {}
}

// Union the valid types
export type AppsActions =
  | LoadApps
  | LoadAppsSuccess
  | LoadAppsFail
  | LoadTypes
  | LoadTypesSucess
  | LoadTypesFail
  | SelectType;
```

## Reducer

The way actions affect state is the reducer's responsibility. Create yet another file within the `state` folder, named `apps.reducer.ts`.

```ts
import { AppsState } from '.';
import { AppsActionTypes, AppsActions } from './apps.actions';

const initialState: AppsState = {
  apps: [],
  types: [],
  selectedTypeId: 0,
  error: ''
};

export function reducer(state = initialState, action: AppsActions): AppsState {
  switch (action.type) {
    case AppsActionTypes.LOAD_APPS_SUCCESS:
      return {
        ...state,
        apps: action.payload,
      };

    case AppsActionTypes.LOAD_TYPES_SUCCESS:
      return {
        ...state,
        types: action.payload,
      };

    case AppsActionTypes.LOAD_APPS_FAILURE:
    case AppsActionTypes.LOAD_TYPES_FAILURE:
      return {
        ...state,
        error: action.payload,
      };

    case AppsActionTypes.SELECT_TYPE:
    return {
        ...state,
        selectedTypeId: action.payload,
    };

    default:
      return state;
  }
}

```

- Instruct the feature store to use the newly created reducer in `apps.module.ts`

```ts
import { reducer } from './state/apps.reducer';
```

```ts
StoreModule.forFeature('apps', reducer),
```

---

## Effects

- Lastly, describe the side effects some of the actions have in a `apps.effects.ts` file with the same folder:

```ts
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

/* NgRx */
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import * as appsActions from './../state/apps.actions';
import { AppsService } from '../apps.service';

@Injectable()
export class AppsEffects {
  constructor(
    private appsService: AppsService,
    private actions$: Actions
  ) {}

  @Effect()
  loadApps$: Observable<Action> = this.actions$.pipe(
    ofType(appsActions.AppsActionTypes.LOAD_APPS),
    switchMap(() =>
      this.appsService.launchers$.pipe(
        map((apps) => new appsActions.LoadAppsSuccess(apps)),
        catchError((err) => of(new appsActions.LoadAppsFail(err)))
      )
    )
  );

  @Effect()
  loadTypes$: Observable<Action> = this.actions$.pipe(
    ofType(appsActions.AppsActionTypes.LOAD_TYPES),
    switchMap(() =>
      this.appsService.appTypes$.pipe(
        map((types) => new appsActions.LoadTypesSucess(types)),
        catchError((err) => of(new appsActions.LoadTypesFail(err)))
      )
    )
  );

  @Effect({ dispatch: false })
  selectLauncher$ = this.actions$.pipe(
    ofType(appsActions.AppsActionTypes.SELECT_TYPE),
    map((action: appsActions.SelectType) => action.payload),
    tap((selectedId) => {
      console.log(selectedId);
    })
  );
}

```

- Install the missing `@ngrx/effects` dependency

```batch
npm install @ngrx/effects
```

- Import the EffectsModule in both the root module (`app.module.ts`) and the feature module (`apps.module.ts`)

```ts
import { EffectsModule } from '@ngrx/store'
```

```ts
@NgModule({
    ...
    imports: [
        ...
        EffectsModule.forRoot([])
    ]
    ...
})
```

```ts
@NgModule({
    ...
    imports: [
        ...
        EffectsModule.forFeature(
            [ AppsEffects ]
        ),
    ]
    ...
})
```

---

## Dev Tools (Optional)

- The Redux dev tools allow us to monitor and manipulate state changes within the Chrome developer tools

- Install the devtools package

```batch
npm install @ngrx/store-devtools
```

- Import it to the `app.module` (after the store and effects init!)

```ts
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
```

```ts
@NgModule({
    ...
    imports: [
        ...
        StoreModule.forRoot({}, {}),
        EffectsModule.forRoot([]),
        !environment.production ? StoreDevtoolsModule.instrument() : [],
        StoreDevtoolsModule.instrument({
            name: 'Mini-Hub App DevTools',
            maxAge: 25,
            logOnly: environment.production,
            }),
        ]
    ...
})
```

- Install [redux-devtools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) Chrome extension

---

## Dispatching actions

- Update the `apps-page.component.ts` to use the store, rather than the service directly

```ts
import { Store } from '@ngrx/store';
import * as fromApps from './../state';
import * as appsActions from './../state/apps.actions';
```

```ts
  constructor(private store: Store<fromApps.State>) {}

  ngOnInit(): void {
    this.store.dispatch(new appsActions.LoadApps());
    this.store.dispatch(new appsActions.LoadTypes());
  }

  typeSelected(target: any) {
    let appType = <HTMLTextAreaElement>target;
    this.store.dispatch(new appsActions.SelectType(+appType.value));
  }
```

- For now, comment out any errors that result from the service removal, both in the code and the template and run the application

- Notice the Actions being dispatched in the Chrome dev tools "Redux" tab

## Selecting data

- Create the needed state selectors in the features's `index.ts` file

```ts
export const getLaunchers = createSelector(
  getAppsFeatureState,
  (state) => state.apps
);

export const getTypes = createSelector(
  getAppsFeatureState,
  (state) => state.types
);

export const getLaunchersWithTypes = createSelector(
  getLaunchers,
  getTypes,
  (launchers, types) =>
    launchers.map((launcher) => ({
      ...launcher,
      typeName: types.find((type) => type.id === launcher.typeId)?.name,
      valid: types.map((type) => type.id).includes(launcher.typeId),
    }))
);

export const getSelectedType = createSelector(
  getAppsFeatureState,
  (state) => state.selectedTypeId
);

export const getFilteredApps = createSelector(
  getLaunchersWithTypes,
  getSelectedType,
  (launchers, selectedType) =>
    launchers.filter((app) =>
      selectedType != 0 ? app.typeId == selectedType : true
    )
);
```

- Use the newly created selectors in the apps.component

```ts
  appTypes$ = this.store.pipe(
    select(fromApps.getTypes)
  )

  filteredLaunchers$ = this.store.pipe(
    select(fromApps.getFilteredApps)
  )
```

---

## Exercise

- Display the user friendly error by selecting it from the state
- Refactor the click counter by using Redux

## Next

[Docker](8-docker.md)
