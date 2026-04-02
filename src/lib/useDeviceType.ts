import { useState, useEffect } from 'react';

/**
 * Custom hook to detect device type based on screen width
 * Uses Tailwind's md breakpoint (768px) to determine mobile vs desktop
 */
export function useDeviceType() {
  // Use server-safe initial state
  const [isMobile, setIsMobile] = useState(() => {
    // Default to false (desktop) during SSR to avoid hydration mismatch
    if (typeof window === 'undefined') return false;
    // Immediate detection on client side
    return window.innerWidth < 768;
  });
  
  const [isInitialized, setIsInitialized] = useState(() => {
    // Mark as initialized immediately on client side
    return typeof window !== 'undefined';
  });

  useEffect(() => {
    // Ensure correct client-side state
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsInitialized(true);
    };

    // Check immediately once (prevent inaccurate initial state)
    checkDeviceType();

    // Listen for window resize events
    window.addEventListener('resize', checkDeviceType);

    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  return { isMobile, isInitialized };
}