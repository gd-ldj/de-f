import { useState, useEffect } from 'react';

/**
 * Custom hook to detect device type based on screen width
 * Uses Tailwind's md breakpoint (768px) to determine mobile vs desktop
 */
export function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // Tailwind md breakpoint
      setIsInitialized(true);
    };

    // Check on mount
    checkDeviceType();

    // Listen for resize events
    window.addEventListener('resize', checkDeviceType);

    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  return { isMobile, isInitialized };
}