"use client";

import React from "react";
import { showToast, withToast, firebaseToast } from "@/lib/utils/toast";

export function ToastDemo() {
  const handleSuccessToast = () => {
    showToast.success("This is a success message!");
  };

  const handleErrorToast = () => {
    showToast.error("This is an error message!");
  };

  const handleInfoToast = () => {
    showToast.info("This is an info message!");
  };

  const handleLoadingToast = () => {
    const toastId = showToast.loading("Loading...");
    setTimeout(() => {
      showToast.dismiss(toastId);
      showToast.success("Loading completed!");
    }, 2000);
  };

  const handleAsyncOperation = async () => {
    await withToast(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loadingMessage: "Processing...",
        successMessage: "Operation completed successfully!",
        errorMessage: "Operation failed!",
      }
    );
  };

  const handleFirebaseToasts = () => {
    firebaseToast.authSuccess("Sign in");
    setTimeout(() => firebaseToast.uploadSuccess(), 1000);
    setTimeout(() => firebaseToast.saveSuccess(), 2000);
    setTimeout(() => firebaseToast.deleteSuccess(), 3000);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Toast Demo</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleSuccessToast}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Success Toast
        </button>
        <button
          onClick={handleErrorToast}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Error Toast
        </button>
        <button
          onClick={handleInfoToast}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Info Toast
        </button>
        <button
          onClick={handleLoadingToast}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
        >
          Loading Toast
        </button>
        <button
          onClick={handleAsyncOperation}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          Async Operation
        </button>
        <button
          onClick={handleFirebaseToasts}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Firebase Toasts
        </button>
      </div>
    </div>
  );
} 