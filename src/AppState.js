import { createActions, handleActions, combineActions } from 'redux-actions';

export const initialState = {
  version: '0.0.1',
};

export const { setAppVersion, clearData } = createActions({
  SET_APP_VERSION: (payload) => payload,
  CLEAR_DATA: () => initialState,
});

export default handleActions(
  {
    [combineActions(setAppVersion, clearData)]: (state, { payload }) => {
      return { ...state, ...payload };
    },
  },
  initialState,
);
