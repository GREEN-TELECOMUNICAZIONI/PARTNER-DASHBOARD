import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useCities, useStreets } from '../../hooks/useCoverage';
import { useDebounce } from '../../hooks/useDebounce';
import type { City, Street, SelectedAddress } from '../../types/api';

interface AddressAutocompleteProps {
  onAddressSelected: (address: SelectedAddress) => void;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelected,
}) => {
  const [cityQuery, setCityQuery] = useState('');
  const [streetQuery, setStreetQuery] = useState('');
  const [civicValue, setCivicValue] = useState('');

  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedStreet, setSelectedStreet] = useState<Street | null>(null);

  // Debounce delle query per ridurre il numero di chiamate API
  // Le chiamate partono solo 400ms dopo che l'utente smette di digitare
  const debouncedCityQuery = useDebounce(cityQuery, 400);
  const debouncedStreetQuery = useDebounce(streetQuery, 400);

  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useCities(debouncedCityQuery);
  const { data: streetsData, isLoading: streetsLoading, error: streetsError } = useStreets(
    debouncedStreetQuery,
    selectedCity?.id || ''
  );

  // Ensure options are always arrays for MUI Autocomplete
  const cities = Array.isArray(citiesData) ? citiesData : [];
  const streets = Array.isArray(streetsData) ? streetsData : [];

  const handleCivicConfirm = (civic: string) => {
    const trimmed = civic.trim();
    if (trimmed && selectedCity && selectedStreet) {
      const address: SelectedAddress = {
        cityId: selectedCity.id,
        cityName: selectedCity.name,
        province: selectedCity.province,
        cityEgon: selectedCity.egonCode,
        streetId: selectedStreet.id,
        streetName: selectedStreet.name,
        street: selectedStreet.street,
        address: selectedStreet.address,
        addressEgon: selectedStreet.egonCode,
        civic: trimmed,
        addressId: selectedStreet.id,
        mainEgon: '', // Will be filled after headers call
        headersId: [], // Will be filled after headers call
      };
      onAddressSelected(address);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Seleziona Indirizzo
      </Typography>
      <Grid container spacing={2}>
        {/* City Autocomplete */}
        <Grid item xs={12} md={4}>
          <Autocomplete
            options={cities}
            getOptionLabel={(option) =>
              typeof option === 'string' ? option : `${option.name} (${option.province})`
            }
            value={selectedCity}
            onChange={(_, newValue) => {
              setSelectedCity(newValue);
              setSelectedStreet(null);
              setCivicValue('');
            }}
            onInputChange={(_, newInputValue) => {
              setCityQuery(newInputValue);
            }}
            loading={citiesLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Città"
                placeholder="Inizia a digitare..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {citiesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            noOptionsText={
              citiesError
                ? "Errore nel caricamento delle città"
                : cityQuery.length < 2
                ? "Digita almeno 2 caratteri"
                : "Nessuna città trovata"
            }
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
          />
        </Grid>

        {/* Street Autocomplete */}
        <Grid item xs={12} md={5}>
          <Autocomplete
            options={streets}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
            value={selectedStreet}
            onChange={(_, newValue) => {
              setSelectedStreet(newValue);
              setCivicValue('');
            }}
            onInputChange={(_, newInputValue) => {
              setStreetQuery(newInputValue);
            }}
            loading={streetsLoading}
            disabled={!selectedCity}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Via"
                placeholder="Inizia a digitare..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {streetsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            noOptionsText={
              streetsError
                ? "Errore nel caricamento delle vie"
                : !selectedCity
                ? "Seleziona prima una città"
                : streetQuery.length < 2
                ? "Digita almeno 2 caratteri"
                : "Nessuna via trovata"
            }
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
          />
        </Grid>

        {/* Civic TextField (input libero - GetStreetNumberByAddress non più disponibile) */}
        <Grid item xs={12} md={3}>
          <TextField
            label="Civico"
            placeholder="Es: 1, 10, 12A..."
            value={civicValue}
            onChange={(e) => setCivicValue(e.target.value)}
            onBlur={() => handleCivicConfirm(civicValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCivicConfirm(civicValue);
              }
            }}
            disabled={!selectedStreet}
            fullWidth
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
