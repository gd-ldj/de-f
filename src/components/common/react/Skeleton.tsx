import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  variant = 'rectangular' 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Specific skeleton components for common patterns
export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        variant="text" 
        className="h-4" 
        width={i === lines - 1 ? '75%' : '100%'} 
      />
    ))}
  </div>
);

export const AvatarSkeleton: React.FC<{ size?: number; className?: string }> = ({ 
  size = 48, 
  className = '' 
}) => (
  <Skeleton 
    variant="circular" 
    width={size} 
    height={size} 
    className={className} 
  />
);

export const ButtonSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Skeleton className={`h-10 rounded-md ${className}`} />
);