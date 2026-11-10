'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff, Trophy } from 'lucide-react';

export interface AthlonImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src?: string | null;
  fallbackSrc?: string;
  fallbackIcon?: 'trophy' | 'imageOff';
  containerClassName?: string;
}

/**
 * Athlon Optimized Image Component
 * - Wraps next/image with automatic skeleton loading & error boundaries.
 * - Handles blob/data preview URLs gracefully without Next.js optimization errors.
 * - Prevents layout shifts and provides a polished fallback when images are missing.
 */
export function AthlonImage({
  src,
  alt = 'Athlon Sport Image',
  className = '',
  containerClassName = '',
  fallbackSrc,
  fallbackIcon = 'trophy',
  fill,
  width,
  height,
  priority = false,
  ...rest
}: AthlonImageProps) {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(src || null);

  useEffect(() => {
    setCurrentSrc(src || null);
    setHasError(false);
    setLoading(true);
  }, [src]);

  // If no source is provided or image failed to load without a fallbackSrc
  if (!currentSrc || (hasError && !fallbackSrc)) {
    return (
      <div
        className={`relative flex items-center justify-center bg-muted/30 border border-foreground/5 text-foreground/30 ${containerClassName || className}`}
        style={!fill ? { width: width || '100%', height: height || '100%' } : undefined}
      >
        {fallbackIcon === 'trophy' ? (
          <Trophy className="w-6 h-6 opacity-40" />
        ) : (
          <ImageOff className="w-5 h-5 opacity-40" />
        )}
      </div>
    );
  }

  // Blob URLs (e.g. client file previews) and base64 URLs should bypass Next.js server optimization
  const isLocalPreview =
    typeof currentSrc === 'string' &&
    (currentSrc.startsWith('blob:') || currentSrc.startsWith('data:'));

  return (
    <div
      className={`relative overflow-hidden ${containerClassName || ''}`}
      style={!fill && (width || height) ? { width, height } : undefined}
    >
      {/* Shimmer loading skeleton */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-muted/40 animate-pulse pointer-events-none" />
      )}

      <Image
        src={currentSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        unoptimized={isLocalPreview}
        onLoad={() => setLoading(false)}
        onError={() => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            setLoading(false);
          } else {
            setHasError(true);
            setLoading(false);
          }
        }}
        className={`transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        {...rest}
      />
    </div>
  );
}
