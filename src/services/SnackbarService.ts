import Snackbar from 'react-native-snackbar';
import config from '../config/app.config';

export const SnackbarService = {
  showSuccess: (message: string) => {
    Snackbar.show({
      text: message,
      duration: Snackbar.LENGTH_SHORT,
      backgroundColor: config.UI.THEME.SUCCESS_COLOR,
      textColor: '#FFFFFF',
    });
  },

  showError: (message: string) => {
    Snackbar.show({
      text: message,
      duration: Snackbar.LENGTH_SHORT,
      backgroundColor: config.UI.THEME.ERROR_COLOR,
      textColor: '#FFFFFF',
    });
  },

  showInfo: (message: string) => {
    Snackbar.show({
      text: message,
      duration: Snackbar.LENGTH_SHORT,
      backgroundColor: config.UI.THEME.SECONDARY_COLOR,
      textColor: '#FFFFFF',
    });
  },

  showWarning: (message: string) => {
    Snackbar.show({
      text: message,
      duration: Snackbar.LENGTH_SHORT,
      backgroundColor: config.UI.THEME.WARNING_COLOR,
      textColor: '#FFFFFF',
    });
  },
};