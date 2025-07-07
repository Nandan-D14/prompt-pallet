"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PageNavigationAlertProps {
  hasUnsavedChanges?: boolean;
  message?: string;
}

export default function PageNavigationAlert({ 
  hasUnsavedChanges = false, 
  message = "This generated prompt are not saving. Are you sure you want to leave?" 
}: PageNavigationAlertProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Handle browser refresh/close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    // Handle route changes within the app
    const handleRouteChange = () => {
      if (hasUnsavedChanges && !isNavigating) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          setIsNavigating(false);
          return false;
        }
      }
      return true;
    };

    // Override window.location changes
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          return;
        }
      }
      return originalPushState.apply(window.history, args);
    };

    window.history.replaceState = function(...args) {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          return;
        }
      }
      return originalReplaceState.apply(window.history, args);
    };

    // Listen for link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && hasUnsavedChanges) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && href !== window.location.pathname) {
          e.preventDefault();
          const confirmed = window.confirm(message);
          if (confirmed) {
            window.location.href = href;
          }
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleLinkClick);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleLinkClick);
      
      // Restore original methods
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [hasUnsavedChanges, message, isNavigating]);

  // This component doesn't render anything visible
  return null;
}

// Hook for easier usage
export function usePageNavigationAlert(hasUnsavedChanges: boolean, message?: string) {
  return { hasUnsavedChanges, message };
}
