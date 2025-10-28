import React, { useState, useCallback } from 'react';
import {
  Typography,
  Button,
  Box,
  Alert,
  Paper,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, Code as CodeIcon } from '@mui/icons-material';
import { AddressAutocomplete } from '../components/coverage/AddressAutocomplete';
import { WidgetCoverageResults } from '../components/coverage/WidgetCoverageResults';
import { LoadingSpinner } from '../components/coverage/LoadingSpinner';
import { IframeCodeDialog } from '../components/iframe';
import { useHeaders, useServices } from '../hooks/useCoverage';
import type { SelectedAddress } from '../types/api';

/**
 * Standalone widget for coverage verification
 * Designed for iframe embedding without layout or map
 */
export const WidgetVerificaCopertura: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [checkCoverage, setCheckCoverage] = useState(false);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [serviceParams, setServiceParams] = useState<{
    headersId: number[];
    cityEgon: string;
    addressEgon: string;
    mainEgon: string;
    streetNumber: string;
  } | null>(null);

  // Query for headers (triggered manually)
  const {
    data: headers,
    isLoading: headersLoading,
    error: headersError,
    refetch: refetchHeaders,
  } = useHeaders(
    selectedAddress?.cityName || '',
    selectedAddress?.province || '',
    selectedAddress?.address || '',
    selectedAddress?.civic || '',
    selectedAddress?.street
  );

  // Query for services (auto-enabled when serviceParams is set)
  const {
    data: services,
    isLoading: servicesLoading,
    error: servicesError,
  } = useServices(
    serviceParams?.headersId ?? [],
    serviceParams?.cityEgon ?? '',
    serviceParams?.addressEgon ?? '',
    serviceParams?.mainEgon ?? '',
    serviceParams?.streetNumber ?? ''
  );

  // Memoized callback to prevent infinite re-renders in AddressAutocomplete
  const handleAddressSelected = useCallback(async (address: SelectedAddress) => {
    // Geocode the address to get coordinates via backend
    try {
      const { coverageApi } = await import('../api/coverage');
      const coords = await coverageApi.geocode(
        `${address.streetName} ${address.civic}`,
        address.cityName,
        address.province
      );
      if (coords) {
        address.coordinates = coords;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Use default coordinates for the city if geocoding fails
    }

    setSelectedAddress(address);
    setCheckCoverage(false);
    setServiceParams(null);
  }, []); // Empty dependencies - this function doesn't depend on any external state

  const handleCheckCoverage = async () => {
    if (!selectedAddress) return;

    setCheckCoverage(true);
    const result = await refetchHeaders();

    if (result.data && result.data.length > 0) {
      // Prepare all parameters for GetCoverageServices
      const headersIdArray = result.data.map(h => parseInt(h.headerId));
      const mainEgonCode = result.data[0].egonCode;

      setServiceParams({
        headersId: headersIdArray,
        cityEgon: selectedAddress.cityEgon,
        addressEgon: selectedAddress.addressEgon,
        mainEgon: mainEgonCode,
        streetNumber: selectedAddress.civic,
      });
    }
  };

  const isLoading = headersLoading || servicesLoading;
  const error = headersError || servicesError;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* Compact header for widget */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Seleziona un indirizzo per verificare la disponibilità dei servizi
        </Typography>

        {/* Bottone Codice Iframe */}
        <IconButton
          onClick={() => setCodeDialogOpen(true)}
          sx={{
            color: '#75ae22',
            border: '1px solid #75ae22',
            '&:hover': {
              backgroundColor: 'rgba(117, 174, 34, 0.08)',
              borderColor: '#5d8b1b',
            },
          }}
          aria-label="Visualizza codice iframe"
          title="Codice Iframe"
        >
          <CodeIcon />
        </IconButton>
      </Box>

      {/* Section 1: Address Autocomplete */}
      <AddressAutocomplete onAddressSelected={handleAddressSelected} />

      {/* Section 2: Check Coverage Button */}
      {selectedAddress && (
        <Paper sx={{ p: 2, mb: 2, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={handleCheckCoverage}
            disabled={isLoading}
            fullWidth
            sx={{ maxWidth: 400 }}
          >
            {isLoading ? 'Verifica in corso...' : 'Verifica Copertura'}
          </Button>
        </Paper>
      )}

      {/* Loading State */}
      {isLoading && (
        <Paper sx={{ p: 3, mb: 2 }}>
          <LoadingSpinner message="Ricerca servizi disponibili..." />
        </Paper>
      )}

      {/* Error State */}
      {error && checkCoverage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Si è verificato un errore durante la verifica della copertura.
          {error instanceof Error && ` Dettagli: ${error.message}`}
        </Alert>
      )}

      {/* No results */}
      {checkCoverage && !isLoading && !error && headers && headers.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Nessuna copertura disponibile per questo indirizzo.
        </Alert>
      )}

      {/* Section 3: Coverage Results */}
      {checkCoverage && !isLoading && !error && services && services.length > 0 && (
        <WidgetCoverageResults services={services} />
      )}

      {/* Iframe Code Dialog */}
      <IframeCodeDialog
        open={codeDialogOpen}
        onClose={() => setCodeDialogOpen(false)}
      />
    </Box>
  );
};
