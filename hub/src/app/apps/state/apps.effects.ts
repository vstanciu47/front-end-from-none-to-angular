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
