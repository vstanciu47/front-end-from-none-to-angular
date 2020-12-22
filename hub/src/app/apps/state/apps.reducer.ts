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
