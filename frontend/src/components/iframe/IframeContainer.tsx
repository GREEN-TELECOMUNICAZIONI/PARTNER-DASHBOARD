import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { IframeLoader } from './IframeLoader';
import type { IframeState } from '../../types/iframe';

interface IframeContainerProps {
  /** URL to load in the iframe */
  src: string;
  /** Accessible title for screen readers */
  title: string;
  /** Height of the iframe (default: 800px) */
  height?: string | number;
  /** Show loading indicator (default: true) */
  showLoader?: boolean;
  /** Callback when iframe loads successfully */
  onLoad?: () => void;
  /** Callback when iframe fails to load */
  onError?: (error: Error) => void;
}

/**
 * Responsive iframe container with loading and error states
 * Handles secure iframe embedding with proper sandbox attributes
 */
export const IframeContainer: React.FC<IframeContainerProps> = ({
  src,
  title,
  height = 800,
  showLoader = true,
  onLoad,
  onError,
}) => {
  const [state, setState] = useState<IframeState>({
    loading: true,
    error: null,
    loaded: false,
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<number | undefined>(undefined);

  // Handle iframe load success
  const handleLoad = useCallback(() => {
    // Clear timeout
    if (loadTimeoutRef.current !== undefined) {
      window.clearTimeout(loadTimeoutRef.current);
    }

    setState({
      loading: false,
      error: null,
      loaded: true,
    });

    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  // Handle iframe load error
  const handleError = useCallback(() => {
    const error = new Error(`Impossibile caricare il widget da: ${src}`);

    // Clear timeout
    if (loadTimeoutRef.current !== undefined) {
      window.clearTimeout(loadTimeoutRef.current);
    }

    setState({
      loading: false,
      error,
      loaded: false,
    });

    if (onError) {
      onError(error);
    }
  }, [src, onError]);

  // Set up loading timeout (30 seconds)
  useEffect(() => {
    loadTimeoutRef.current = window.setTimeout(() => {
      if (state.loading && !state.loaded) {
        handleError();
      }
    }, 30000);

    return () => {
      if (loadTimeoutRef.current !== undefined) {
        window.clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [state.loading, state.loaded, handleError]);

  // Normalize height prop
  const normalizedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        minHeight: normalizedHeight,
      }}
    >
      {/* Loading state */}
      {showLoader && state.loading && !state.error && (
        <IframeLoader message="Caricamento widget verifica copertura..." />
      )}

      {/* Iframe element */}
      <Box
        component="iframe"
        ref={iframeRef}
        src={src}
        title={title}
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-forms"
        sx={{
          width: '100%',
          height: normalizedHeight,
          border: 'none',
          borderRadius: 1,
          display: state.loading ? 'none' : 'block',
          backgroundColor: 'background.paper',
        }}
        // Accessibility attributes
        aria-label={title}
        role="application"
        loading="lazy"
      />
    </Box>
  );
};
