import React, { useCallback } from 'react';
import { Container, Typography, Box, Paper, Link as MuiLink } from '@mui/material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { IframeContainer, IframeErrorBoundary } from '../components/iframe';

/**
 * Coverage verification page with iframe integration
 * Embeds the standalone widget in an iframe for easy integration
 */
export const VerificaCoperturaWidget: React.FC = () => {

  // Handle iframe load success
  const handleIframeLoad = useCallback(() => {
    console.log('Widget iframe loaded successfully');
  }, []);

  // Handle iframe load error
  const handleIframeError = useCallback((error: Error) => {
    console.error('Widget iframe failed to load:', error);
  }, []);

  return (
    <Container maxWidth="lg">
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Verifica Copertura
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Widget integrazione verifica copertura servizi
        </Typography>
      </Box>

      {/* Iframe Container with Error Boundary */}
      <IframeErrorBoundary onError={handleIframeError}>
        <Paper
          sx={{
            p: 0,
            mb: 3,
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <IframeContainer
            src="/widget-verifica-copertura"
            title="Widget Verifica Copertura"
            height={1200}
            showLoader={true}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </Paper>
      </IframeErrorBoundary>

      {/* Link to Complete Version */}
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Preferisci la versione completa con mappa interattiva?
        </Typography>
        <MuiLink
          component={Link}
          to="/verifica-copertura"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 1,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Vai alla Versione Completa
          <OpenInNewIcon fontSize="small" />
        </MuiLink>
      </Paper>
    </Container>
  );
};
