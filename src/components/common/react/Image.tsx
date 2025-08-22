import React, { useState, useEffect } from 'react';
import placeholderImg from '@/assets/imgs/placeholder.svg';

// Type definition for Astro imported images
type AstroImageImport = {
  src: string;
  width: number;
  height: number;
  format: string;
} | string;

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Enhanced Image component with automatic fallback to placeholder
 * Handles image loading errors gracefully by showing a default placeholder
 */
const Image: React.FC<ImageProps> = ({
  src,
  alt,
  fallbackSrc,
  onError,
  className = '',
  ...props
}) => {
  // Ensure fallbackSrc has a valid default value
  // Try to get the correct path from imported asset first
  let defaultFallbackPath: string;
  
  if (fallbackSrc) {
    defaultFallbackPath = fallbackSrc;
  } else if (placeholderImg && typeof placeholderImg === 'object' && 'src' in placeholderImg) {
    // Use the Astro imported asset path
    defaultFallbackPath = (placeholderImg as { src: string }).src;
  } else if (typeof placeholderImg === 'string') {
    defaultFallbackPath = placeholderImg;
  } else {
    // Fallback to public directory path
    defaultFallbackPath = '/placeholder.svg';
  }
  
  const defaultFallback = defaultFallbackPath;
  
  // console.log("🖼️ Image component initialized:", {
  //   src,
  //   fallbackSrc,
  //   placeholderImg: typeof placeholderImg === 'object' && 'src' in placeholderImg ? (placeholderImg as { src: string }).src : placeholderImg,
  //   defaultFallback
  // });
    
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Handle successful image loading
   */
  const handleLoad = () => {
    setIsLoading(false);
  };

  /**
   * Handle image loading errors
   * Switches to fallback image when original fails to load
   */
  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log("❌ Image failed to load:", imgSrc, "hasError:", hasError);
    setIsLoading(false);
    
    if (!hasError && imgSrc !== defaultFallback) {
      console.log("🔄 Switching to fallback:", defaultFallback);
      setHasError(true);
      setImgSrc(defaultFallback);
    } else {
      console.log("⚠️ Fallback also failed or already in error state");
    }
    
    // Call custom onError handler if provided
    if (onError) {
      onError(event);
    }
  };

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      className={`${className} ${hasError ? 'image-fallback' : ''} ${isLoading ? 'image-loading' : ''}`}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
};

export default Image;