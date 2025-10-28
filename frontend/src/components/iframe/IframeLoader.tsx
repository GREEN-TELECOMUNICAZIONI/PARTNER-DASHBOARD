import React from 'react';
import { Box, Skeleton, Typography, CircularProgress } from '@mui/material';

interface IframeLoaderProps {
  /** Optional custom loading message */
  message?: string;
}

/**
 * Loading placeholder component for iframe
 * Shows animated skeleton and loading indicator while iframe loads
 */
export const IframeLoader: React.FC<IframeLoaderProps> = ({
  message = 'Caricamento widget in corso...'
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 4,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* Animated skeleton placeholder */}
      <Box sx={{ width: '100%', maxWidth: 800 }}>
        <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="60%" height={40} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Loading indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </Box>
  );
};
