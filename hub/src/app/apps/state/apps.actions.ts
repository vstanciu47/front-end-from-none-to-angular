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
