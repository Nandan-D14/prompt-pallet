import toast from "react-hot-toast";

/**
 * Toast utility functions for consistent notifications across the app
 */

export const showToast = {
  /**
   * Show a success toast
   */
  success: (message: string) => {
    return toast.success(message, {
      id: `success-${Date.now()}`,
    });
  },

  /**
   * Show an error toast
   */
  error: (message: string) => {
    return toast.error(message, {
      id: `error-${Date.now()}`,
    });
  },

  /**
   * Show a loading toast
   */
  loading: (message: string) => {
    return toast.loading(message, {
      id: `loading-${Date.now()}`,
    });
  },

  /**
   * Show an info toast
   */
  info: (message: string) => {
    return toast(message, {
      id: `info-${Date.now()}`,
      icon: "ℹ️",
    });
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },
};

/**
 * Promise wrapper for async operations with loading states
 */
export const withToast = async <T>(
  promise: Promise<T>,
  {
    loadingMessage = "Loading...",
    successMessage = "Success!",
    errorMessage = "Something went wrong",
  }: {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
  } = {}
): Promise<T> => {
  const loadingToast = showToast.loading(loadingMessage);

  try {
    const result = await promise;
    toast.dismiss(loadingToast);
    showToast.success(successMessage);
    return result;
  } catch (error) {
    toast.dismiss(loadingToast);
    const errorMsg = error instanceof Error ? error.message : errorMessage;
    showToast.error(errorMsg);
    throw error;
  }
};

/**
 * Firebase-specific toast helpers
 */
export const firebaseToast = {
  authSuccess: (action: string) => showToast.success(`${action} successful!`),
  authError: (error: any) => {
    const message = error?.message || "Authentication failed";
    showToast.error(message);
  },
  uploadSuccess: () => showToast.success("File uploaded successfully!"),
  uploadError: (error: any) => {
    const message = error?.message || "Upload failed";
    showToast.error(message);
  },
  saveSuccess: () => showToast.success("Saved successfully!"),
  saveError: (error: any) => {
    const message = error?.message || "Save failed";
    showToast.error(message);
  },
  deleteSuccess: () => showToast.success("Deleted successfully!"),
  deleteError: (error: any) => {
    const message = error?.message || "Delete failed";
    showToast.error(message);
  },
}; 