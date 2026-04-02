import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

interface ToastState extends ToastProps {
  id: string;
  timestamp: number;
}

// Global toast state management
let toastState: ToastState[] = [];
let toastListeners: ((toasts: ToastState[]) => void)[] = [];

const notifyListeners = () => {
  toastListeners.forEach(listener => listener([...toastState]));
};

/**
 * Toast utility functions for showing notifications
 */
export const toast = {
  success: (message: string, options?: Partial<ToastProps>) => 
    showToast({ type: 'success', message, ...options }),
  
  error: (message: string, options?: Partial<ToastProps>) => 
    showToast({ type: 'error', message, ...options }),
  
  warning: (message: string, options?: Partial<ToastProps>) => 
    showToast({ type: 'warning', message, ...options }),
  
  info: (message: string, options?: Partial<ToastProps>) => 
    showToast({ type: 'info', message, ...options }),
};

function showToast(props: ToastProps) {
  const id = props.id || `toast-${Date.now()}-${Math.random()}`;
  const newToast: ToastState = {
    ...props,
    id,
    timestamp: Date.now(),
    duration: props.duration ?? (props.type === 'error' ? 50000 : 3000),
  };

  toastState.push(newToast);
  notifyListeners();

  // Auto-dismiss after duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => dismissToast(id), newToast.duration);
  }

  return id;
}

function dismissToast(id: string) {
  const index = toastState.findIndex(toast => toast.id === id);
  if (index > -1) {
    toastState.splice(index, 1);
    notifyListeners();
  }
}

/**
 * Individual Toast component
 */
const ToastItem: React.FC<ToastState & { onDismiss: (id: string) => void }> = ({
  id,
  type = 'info',
  title,
  message,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 200); // Wait for animation
  };

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-white',
      borderColor: 'border-green-200',
      textColor: 'text-gray-900',
      iconColor: 'text-green-500',
      accentColor: 'border-l-green-500',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-white',
      borderColor: 'border-red-200',
      textColor: 'text-gray-900',
      iconColor: 'text-red-500',
      accentColor: 'border-l-red-500',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-white',
      borderColor: 'border-amber-200',
      textColor: 'text-gray-900',
      iconColor: 'text-amber-500',
      accentColor: 'border-l-amber-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-white',
      borderColor: 'border-blue-200',
      textColor: 'text-gray-900',
      iconColor: 'text-blue-500',
      accentColor: 'border-l-blue-500',
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        max-w-sm w-full ${config.bgColor} ${config.borderColor} ${config.accentColor}
        border border-l-4 rounded-lg shadow-lg backdrop-blur-sm pointer-events-auto
        hover:shadow-xl transition-shadow duration-200
      `}
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0">
          <div className={`p-1 rounded-full ${config.iconColor.replace('text-', 'bg-').replace('-500', '-100')}`}>
            <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
          </div>
        </div>
        <div className="ml-3 flex-1 min-w-0">
          {title && (
            <p className={`text-sm font-semibold ${config.textColor} leading-5`}>
              {title}
            </p>
          )}
          <p className={`text-sm ${config.textColor} ${title ? 'mt-1' : ''} leading-5 break-words`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className={`
              rounded-full p-1.5 inline-flex items-center justify-center
              text-gray-400 hover:text-gray-600 hover:bg-gray-100
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300
              transition-colors duration-150
            `}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Toast container component
 */
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter(listener => listener !== setToasts);
    };
  }, []);

  // Return consistent structure for SSR and client
  if (!isClient) {
    return (
      <div className="fixed top-20 right-4 z-50 flex flex-col space-y-3 pointer-events-none max-h-screen overflow-hidden">
        {/* Empty during SSR */}
      </div>
    );
  }

  return createPortal(
    <div className="fixed top-20 right-4 z-50 flex flex-col space-y-3 pointer-events-none max-h-screen overflow-hidden">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onDismiss={dismissToast} />
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;