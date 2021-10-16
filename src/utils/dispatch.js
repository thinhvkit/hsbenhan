import { ToastActionsCreators } from 'react-native-redux-toast';

export const toastDispatches = (dispatch) => ({
  error: (message) => dispatch(ToastActionsCreators.displayError(message)),
  warn: (message) => dispatch(ToastActionsCreators.displayWarning(message)),
  info: (message) => dispatch(ToastActionsCreators.displayInfo(message)),
});
