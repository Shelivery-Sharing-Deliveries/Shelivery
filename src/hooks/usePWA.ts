import { useEffect, useState } from 'react';

export function usePWA() {
  const [isPWA, setIsPWA] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if running in PWA mode
    const checkPWAMode = () => {
      const isInStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      setIsPWA(isInStandaloneMode);
      setIsLoading(false);
    };

    checkPWAMode();

    // Listen for display-mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => {
      checkPWAMode();
    };

    // Add event listener if available
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if ((mediaQuery as any).addListener) {
      // Fallback for older browsers
      (mediaQuery as any).addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if ((mediaQuery as any).removeListener) {
        (mediaQuery as any).removeListener(handleChange);
      }
    };
  }, []);

  return { isPWA, isLoading };
}
