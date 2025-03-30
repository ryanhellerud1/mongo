/**
 * Function to suppress ResizeObserver loop limit exceeded error
 * This error is a warning and doesn't affect functionality
 */
export const suppressResizeObserverError = () => {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      args[0]?.includes?.('ResizeObserver loop limit exceeded') ||
      args[0]?.includes?.('ResizeObserver loop completed with undelivered notifications')
    ) {
      return;
    }
    originalConsoleError(...args);
  };
}; 