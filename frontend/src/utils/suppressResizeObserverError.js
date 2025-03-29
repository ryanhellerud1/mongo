// Utility to suppress ResizeObserver loop error messages
export const suppressResizeObserverError = () => {
  const resizeObserverError = 'ResizeObserver loop completed with undelivered notifications.';
  
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args.length > 0 && typeof args[0] === 'string' && args[0].includes(resizeObserverError)) {
      // Suppress ResizeObserver error
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // For browsers that use window.error
  window.addEventListener('error', (event) => {
    if (event.message.includes(resizeObserverError)) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return true;
    }
    return false;
  }, true);
}; 