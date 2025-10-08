import { enqueueSnackbar, SnackbarKey, closeSnackbar } from 'notistack';

// Modern snackbar configuration inspired by Material-UI, Google, etc.
export const snackbarConfig = {
  variant: 'default' as const,
  anchorOrigin: {
    vertical: 'top' as const,
    horizontal: 'right' as const,
  },
  autoHideDuration: 4000,
  preventDuplicate: true,
  dense: false,
  maxSnack: 3,
};

// Modern snackbar functions with better UX
export const showToast = {
  success: (message: string, options?: { description?: string; action?: string }) => {
    return enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: 3000,
      ...options,
    });
  },
  
  error: (message: string, options?: { description?: string; action?: string }) => {
    return enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 4000,
      ...options,
    });
  },
  
  info: (message: string, options?: { description?: string; action?: string }) => {
    return enqueueSnackbar(message, {
      variant: 'info',
      autoHideDuration: 3000,
      ...options,
    });
  },
  
  warning: (message: string, options?: { description?: string; action?: string }) => {
    return enqueueSnackbar(message, {
      variant: 'warning',
      autoHideDuration: 3500,
      ...options,
    });
  },
  
  loading: (message: string) => {
    return enqueueSnackbar(message, {
      variant: 'info',
      persist: true,
      autoHideDuration: null,
    });
  },
  
  dismiss: (snackbarKey: SnackbarKey) => {
    closeSnackbar(snackbarKey);
  },
  
  dismissAll: () => {
    closeSnackbar();
  },
  
  // Custom action snackbar (like Google Material Design)
  action: (message: string, action: { label: string; onClick: () => void }) => {
    return enqueueSnackbar(message, {
      variant: 'default',
      action: action.label,
    });
  },
  
  // Promise-based snackbar
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    const loadingKey = enqueueSnackbar(messages.loading, {
      variant: 'info',
      persist: true,
    });

    return promise
      .then((data) => {
        closeSnackbar(loadingKey);
        const successMessage = typeof messages.success === 'function' 
          ? messages.success(data) 
          : messages.success;
        return enqueueSnackbar(successMessage, { variant: 'success' });
      })
      .catch((error) => {
        closeSnackbar(loadingKey);
        const errorMessage = typeof messages.error === 'function' 
          ? messages.error(error) 
          : messages.error;
        return enqueueSnackbar(errorMessage, { variant: 'error' });
      });
  },
};

// Export default snackbar
export default enqueueSnackbar;
