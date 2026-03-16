import Snackbar from 'react-native-snackbar';
import config from '../config/app.config';

export const SnackbarService = {
  showSuccess: (message: any) => {
    const text = typeof message === 'string' ? message : String(message);
    Snackbar.show({
      text: text,
      duration: Snackbar.LENGTH_SHORT,
      backgroundColor: config.UI.THEME.SUCCESS_COLOR,
      textColor: '#FFFFFF',
    });
  },

  showError: (message: any) => {
    let text = 'An error occurred';
    
    if (typeof message === 'string') {
      text = message;
    } else if (Array.isArray(message)) {
      text = message.join('. ');
    } else if (typeof message === 'object' && message !== null) {
      text = message.message || JSON.stringify(message);
    } else if (message) {
      text = String(message);
    }

    Snackbar.show({
      text: text,
      duration: Snackbar.LENGTH_LONG,
      backgroundColor: config.UI.THEME.ERROR_COLOR,
      textColor: '#FFFFFF',
    });
  },

  showInfo: (message: any) => {
    const text = typeof message === 'string' ? message : String(message);
    Snackbar.show({
      text: text,
      duration: Snackbar.LENGTH_SHORT,
      backgroundColor: config.UI.THEME.SECONDARY_COLOR,
      textColor: '#FFFFFF',
    });
  },

  showWarning: (message: any) => {
    const text = typeof message === 'string' ? message : String(message);
    Snackbar.show({
      text: text,
      duration: Snackbar.LENGTH_SHORT,
      backgroundColor: config.UI.THEME.WARNING_COLOR,
      textColor: '#FFFFFF',
    });
  },
};