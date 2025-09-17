import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DraggableFloatingButtonProps {
  icon?: React.ReactNode;
  className?: string;
  buttonSize?: number;
  children?: React.ReactNode;
  onToggle?: (isOpen: boolean) => void;
}

const DraggableFloatingButton: React.FC<DraggableFloatingButtonProps> = ({ icon, className = '', buttonSize = 60, children, onToggle }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 120 });
  const [isInitialized, setIsInitialized] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPosition = useRef({ x: 0, y: 0 });

  // Initialize position to top right with 120px from top
  useEffect(() => {
    const updateInitialPosition = () => {
      const margin = 20;
      const topOffset = 120; // Distance from top
      const newPosition = {
        x: window.innerWidth - buttonSize - margin,
        y: topOffset,
      };
      setPosition(newPosition);
      setIsInitialized(true);
    };

    updateInitialPosition();
    window.addEventListener('resize', updateInitialPosition);
    return () => window.removeEventListener('resize', updateInitialPosition);
  }, [buttonSize]);

  // Disable/enable page scrolling when modal is open/closed
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;

      // Disable scrolling by setting body overflow to hidden
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Re-enable scrolling and restore scroll position
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Snap to edge function
  const snapToEdge = useCallback(
    (x: number, y: number) => {
      const margin = 20;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Determine which edge is closest
      const distanceToLeft = x;
      const distanceToRight = windowWidth - x - buttonSize;
      const distanceToTop = y;
      const distanceToBottom = windowHeight - y - buttonSize;

      const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);

      let newX = x;
      let newY = y;

      if (minDistance === distanceToLeft) {
        newX = margin;
      } else if (minDistance === distanceToRight) {
        newX = windowWidth - buttonSize - margin;
      } else if (minDistance === distanceToTop) {
        newY = margin;
      } else {
        newY = windowHeight - buttonSize - margin;
      }

      // Ensure button stays within bounds
      newX = Math.max(margin, Math.min(newX, windowWidth - buttonSize - margin));
      newY = Math.max(margin, Math.min(newY, windowHeight - buttonSize - margin));

      return { x: newX, y: newY };
    },
    [buttonSize]
  );

  const handleDragStart = (event: React.MouseEvent | React.TouchEvent) => {
    // Prevent default behavior to avoid page scrolling/bouncing on mobile
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    dragStartPosition.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleDrag = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      // Prevent default behavior to avoid page scrolling/bouncing on mobile
      event.preventDefault();
      event.stopPropagation();

      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      const newX = clientX - dragStartPosition.current.x;
      const newY = clientY - dragStartPosition.current.y;

      // Constrain to window bounds during drag
      const margin = 10;
      const constrainedX = Math.max(margin, Math.min(newX, window.innerWidth - buttonSize - margin));
      const constrainedY = Math.max(margin, Math.min(newY, window.innerHeight - buttonSize - margin));

      setPosition({ x: constrainedX, y: constrainedY });
    },
    [isDragging, buttonSize]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // Snap to nearest edge
    const snappedPosition = snapToEdge(position.x, position.y);
    setPosition(snappedPosition);
  }, [isDragging, position.x, position.y, snapToEdge]);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleDrag(e);
      const handleMouseUp = () => handleDragEnd();
      const handleTouchMove = (e: TouchEvent) => handleDrag(e);
      const handleTouchEnd = () => handleDragEnd();

      // Add passive: false for touch events to allow preventDefault
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      // Prevent body scroll during drag on mobile
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);

        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  const handleClick = () => {
    if (!isDragging) {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      onToggle?.(newIsOpen);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    onToggle?.(false);
  };

  const defaultIcon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
      <circle cx="12" cy="21" r="1" fill="currentColor" />
      <circle cx="3" cy="12" r="1" fill="currentColor" />
      <circle cx="21" cy="12" r="1" fill="currentColor" />
      <circle cx="18.364" cy="5.636" r="1" fill="currentColor" />
      <circle cx="5.636" cy="18.364" r="1" fill="currentColor" />
      <circle cx="18.364" cy="18.364" r="1" fill="currentColor" />
      <circle cx="5.636" cy="5.636" r="1" fill="currentColor" />
    </svg>
  );

  // Don't render until initialized to prevent flash
  if (!isInitialized) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <motion.div
        ref={dragRef}
        className={`fixed z-50 cursor-pointer select-none ${className}`}
        style={{
          left: position.x,
          top: position.y,
          width: buttonSize,
          height: buttonSize,
          touchAction: 'none', // Disable browser touch actions
          userSelect: 'none', // Prevent text selection
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none', // Disable iOS callout
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        // transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="w-full h-full bg-primary rounded-full shadow-lg flex items-center justify-center text-white"
          animate={{
            boxShadow: ['0 4px 20px rgba(59, 130, 246, 0.4)', '0 8px 30px rgba(59, 130, 246, 0.6)', '0 4px 20px rgba(59, 130, 246, 0.4)'],
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: {
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            {icon || defaultIcon}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed inset-0 z-[100] w-full h-full " initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={closeModal}>
            <motion.div
              className="fixed bg-white overflow-hidden  w-full h-full"
              initial={{
                scale: 0.8,
                opacity: 0,
                y: 50,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                y: 50,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: 0.4,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors" onClick={closeModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Modal Content */}
              <div className="h-full overflow-auto">
                {children || (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-4">Modal Content</h2>
                      <p>Please provide content through the children prop</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DraggableFloatingButton;
