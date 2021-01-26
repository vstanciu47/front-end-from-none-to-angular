import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromRoot from '../../state/app.state';
import { AppType, Launcher } from '../apps.service';

export interface AppsState {
  apps: Launcher[];
  types: AppType[];
  selectedTypeId: number;
  error: string;
}

export interface State extends fromRoot.State {
  apps: AppsState;
}

// Selector functions
const getAppsFeatureState = createFeatureSelector<AppsState>('apps');

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

export const getError = createSelector(
  getAppsFeatureState,
  (state) => state.error
);
