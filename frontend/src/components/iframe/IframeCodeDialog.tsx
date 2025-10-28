import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface IframeCodeDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog component for displaying and copying iframe integration code
 * Provides a formatted HTML code snippet with copy-to-clipboard functionality
 */
export const IframeCodeDialog: React.FC<IframeCodeDialogProps> = ({ open, onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // Generate dynamic iframe code with current hostname
  const iframeCode = `<iframe
  src="${window.location.origin}/widget-verifica-copertura"
  width="100%"
  height="1200"
  frameborder="0"
  scrolling="auto"
  title="Widget Verifica Copertura"
  style="border: none; max-width: 100%;"
  allow="geolocation"
></iframe>`;

  /**
   * Copy iframe code to clipboard
   * Shows success notification or fallback alert on error
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeCode);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback: notify user to copy manually
      alert('Impossibile copiare automaticamente. Seleziona e copia manualmente il codice.');
    }
  };

  const handleCloseSnackbar = () => {
    setCopySuccess(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="iframe-code-dialog-title"
        aria-describedby="iframe-code-dialog-description"
      >
        <DialogTitle id="iframe-code-dialog-title">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="span" color="#444444">
              Codice Iframe - Integrazione Widget
            </Typography>
            <IconButton
              onClick={onClose}
              size="small"
              aria-label="Chiudi dialog"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography
            id="iframe-code-dialog-description"
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Copia questo codice HTML per integrare il widget di verifica copertura sul tuo sito
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Box
            sx={{
              backgroundColor: '#f5f5f5',
              padding: 2,
              borderRadius: 1,
              border: '1px solid #e0e0e0',
              position: 'relative',
            }}
            role="region"
            aria-label="Codice iframe"
          >
            <Typography
              component="pre"
              sx={{
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#444444',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {iframeCode}
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong>
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>L'URL è dinamico e si adatta al tuo dominio</li>
              <li>L'altezza consigliata è 1200px (modificabile in base alle tue esigenze)</li>
              <li>Il widget è responsive e si adatta automaticamente alla larghezza</li>
              <li>Permesso "geolocation" opzionale per funzionalità future</li>
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Chiudi
          </Button>
          <Button
            variant="contained"
            startIcon={<CopyIcon />}
            onClick={handleCopy}
            sx={{
              backgroundColor: '#75ae22',
              '&:hover': {
                backgroundColor: '#5d8b1b',
              },
            }}
            aria-label="Copia codice iframe negli appunti"
          >
            Copia Codice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Codice copiato negli appunti!
        </Alert>
      </Snackbar>
    </>
  );
};
