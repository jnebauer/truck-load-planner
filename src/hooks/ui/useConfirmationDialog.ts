// ============================================================================
// DIRECTIVE & IMPORTS
// ============================================================================
'use client';

import { useState, useCallback } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
/**
 * State structure for confirmation dialog
 */
interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
}

// ============================================================================
// HOOK
// ============================================================================
/**
 * Hook for managing confirmation dialogs throughout the application
 * Provides a reusable confirmation dialog with loading states and callbacks
 * 
 * @example
 * ```tsx
 * const confirmationDialog = useConfirmationDialog();
 * 
 * const handleDelete = () => {
 *   confirmationDialog.showConfirmation({
 *     title: 'Delete Item',
 *     message: 'Are you sure you want to delete this item?',
 *     confirmText: 'Delete',
 *     cancelText: 'Cancel',
 *     variant: 'danger',
 *     onConfirm: () => {
 *       deleteItem();
 *     }
 *   });
 * };
 * 
 * return (
 *   <>
 *     <button onClick={handleDelete}>Delete</button>
 *     <ConfirmationDialog
 *       isOpen={confirmationDialog.isOpen}
 *       onClose={confirmationDialog.hideConfirmation}
 *       onConfirm={confirmationDialog.handleConfirm}
 *       title={confirmationDialog.title}
 *       message={confirmationDialog.message}
 *       confirmText={confirmationDialog.confirmText}
 *       cancelText={confirmationDialog.cancelText}
 *       variant={confirmationDialog.variant}
 *       loading={confirmationDialog.loading}
 *     />
 *   </>
 * );
 * ```
 * 
 * @returns Object with dialog state and control functions
 */
export const useConfirmationDialog = () => {
  const [state, setState] = useState<ConfirmationDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger'
  });

  const [loading, setLoading] = useState(false);

  const showConfirmation = useCallback((config: Omit<ConfirmationDialogState, 'isOpen'>) => {
    setState({
      isOpen: true,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      variant: config.variant || 'danger',
      onConfirm: config.onConfirm,
      onCancel: config.onCancel
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
    setLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (state.onConfirm) {
      setLoading(true);
      try {
        await state.onConfirm();
        hideConfirmation();
      } catch (error) {
        console.error('Confirmation action failed:', error);
        setLoading(false);
        // Don't hide dialog on error, let user retry
      }
    } else {
      hideConfirmation();
    }
  }, [state, hideConfirmation]);

  const handleCancel = useCallback(() => {
    if (state.onCancel) {
      state.onCancel();
    }
    hideConfirmation();
  }, [state, hideConfirmation]);

  return {
    isOpen: state.isOpen,
    title: state.title,
    message: state.message,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    variant: state.variant,
    loading,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
    handleCancel
  };
};
