import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Paper,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { AddressAutocomplete } from '../components/coverage/AddressAutocomplete';
import { MapView } from '../components/coverage/MapView';
import { CoverageResults } from '../components/coverage/CoverageResults';
import { LoadingSpinner } from '../components/coverage/LoadingSpinner';
import { useHeaders, useServices } from '../hooks/useCoverage';
import type { SelectedAddress } from '../types/api';

export const VerificaCopertura: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [checkCoverage, setCheckCoverage] = useState(false);
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
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Verifica Copertura
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Seleziona un indirizzo per verificare la disponibilità dei servizi TWT
        </Typography>
      </Box>

      {/* Section 1: Address Autocomplete */}
      <AddressAutocomplete onAddressSelected={handleAddressSelected} />

      {/* Map View */}
      {selectedAddress && (
        <MapView
          position={selectedAddress.coordinates || [45.0703, 7.6869]} // Default to Turin
          addressText={`${selectedAddress.streetName} ${selectedAddress.civic}, ${selectedAddress.cityName}`}
        />
      )}

      {/* Section 2: Check Coverage Button */}
      {selectedAddress && (
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={handleCheckCoverage}
            disabled={isLoading}
            sx={{ minWidth: 250 }}
          >
            {isLoading ? 'Verifica in corso...' : 'Verifica Copertura'}
          </Button>
        </Paper>
      )}

      {/* Loading State */}
      {isLoading && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <LoadingSpinner message="Ricerca servizi disponibili..." />
        </Paper>
      )}

      {/* Error State */}
      {error && checkCoverage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Si è verificato un errore durante la verifica della copertura.
          {error instanceof Error && ` Dettagli: ${error.message}`}
        </Alert>
      )}

      {/* No results */}
      {checkCoverage && !isLoading && !error && headers && headers.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Nessuna copertura disponibile per questo indirizzo.
        </Alert>
      )}

      {/* Section 3: Coverage Results */}
      {checkCoverage && !isLoading && !error && services && services.length > 0 && (
        <CoverageResults services={services} />
      )}
    </Container>
  );
};
