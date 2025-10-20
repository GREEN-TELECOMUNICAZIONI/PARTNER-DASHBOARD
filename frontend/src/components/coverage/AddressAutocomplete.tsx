import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useCities, useStreets, useCivics } from '../../hooks/useCoverage';
import { useDebounce } from '../../hooks/useDebounce';
import type { City, Street, Civic, SelectedAddress } from '../../types/api';

interface AddressAutocompleteProps {
  onAddressSelected: (address: SelectedAddress) => void;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelected,
}) => {
  const [cityQuery, setCityQuery] = useState('');
  const [streetQuery, setStreetQuery] = useState('');

  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedStreet, setSelectedStreet] = useState<Street | null>(null);
  const [selectedCivic, setSelectedCivic] = useState<Civic | null>(null);

  // Debounce delle query per ridurre il numero di chiamate API
  // Le chiamate partono solo 400ms dopo che l'utente smette di digitare
  const debouncedCityQuery = useDebounce(cityQuery, 400);
  const debouncedStreetQuery = useDebounce(streetQuery, 400);

  const { data: citiesData, isLoading: citiesLoading, error: citiesError } = useCities(debouncedCityQuery);
  const { data: streetsData, isLoading: streetsLoading, error: streetsError } = useStreets(
    debouncedStreetQuery,
    selectedCity?.id || ''
  );
  const { data: civicsData, isLoading: civicsLoading, error: civicsError } = useCivics(
    selectedStreet?.id || ''
  );

  // Ensure options are always arrays for MUI Autocomplete
  const cities = Array.isArray(citiesData) ? citiesData : [];
  const streets = Array.isArray(streetsData) ? streetsData : [];
  const civics = Array.isArray(civicsData) ? civicsData : [];

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
              setSelectedCivic(null);
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
              setSelectedCivic(null);
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

        {/* Civic Autocomplete */}
        <Grid item xs={12} md={3}>
          <Autocomplete
            options={civics}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.civic}
            value={selectedCivic}
            onChange={(_, newValue) => {
              setSelectedCivic(newValue);
              // Trigger address selection only when civic is selected
              if (newValue && selectedCity && selectedStreet) {
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
                  civic: newValue.civic,
                  addressId: newValue.addressId,
                  mainEgon: '', // Will be filled after headers call
                  headersId: [], // Will be filled after headers call
                };
                onAddressSelected(address);
              }
            }}
            loading={civicsLoading}
            disabled={!selectedStreet}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Civico"
                placeholder="Seleziona..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {civicsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            noOptionsText={
              civicsError
                ? "Errore nel caricamento dei civici"
                : !selectedStreet
                ? "Seleziona prima una via"
                : "Nessun civico trovato"
            }
            isOptionEqualToValue={(option, value) =>
              option?.civic === value?.civic && option?.addressId === value?.addressId
            }
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
