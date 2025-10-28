import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import { Refresh as RefreshIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface IframeErrorBoundaryProps {
  /** Children components to wrap */
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
  /** Optional error callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface IframeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for iframe embedding
 * Catches and handles errors in iframe components with retry capability
 */
export class IframeErrorBoundary extends Component<
  IframeErrorBoundaryProps,
  IframeErrorBoundaryState
> {
  constructor(props: IframeErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): IframeErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging
    console.error('IframeErrorBoundary caught an error:', error, errorInfo);

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'error.light',
          }}
          role="alert"
          aria-live="assertive"
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Errore nel caricamento del widget
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Si è verificato un errore durante il caricamento del widget di verifica copertura.
              {this.state.error && (
                <Box component="span" sx={{ display: 'block', mt: 1, fontFamily: 'monospace' }}>
                  {this.state.error.message}
                </Box>
              )}
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Retry button */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
            >
              Riprova
            </Button>

            {/* Link to advanced version */}
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              to="/verifica-copertura/avanzata"
              startIcon={<OpenInNewIcon />}
            >
              Versione Avanzata
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
            Se il problema persiste, prova ad utilizzare la versione avanzata con mappa interattiva.
          </Typography>
        </Paper>
      );
    }

    return this.props.children;
  }
}
