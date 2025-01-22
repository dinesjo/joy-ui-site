import { useState } from 'react';

export function useSnackbar() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', color: 'neutral' });

  const showSnackbar = (message, color = 'neutral') => {
    setSnackbar({ open: true, message, color });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return { snackbar, showSnackbar, hideSnackbar };
}
