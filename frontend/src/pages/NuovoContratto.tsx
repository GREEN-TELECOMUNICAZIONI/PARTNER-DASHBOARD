import React from 'react';
import { Container, Typography, Box, Paper, Alert } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';

export const NuovoContratto: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Nuovo Contratto
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Crea un nuovo contratto per un cliente
        </Typography>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <ConstructionIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Alert severity="info">
          Questa funzionalità è in fase di sviluppo e sarà disponibile a breve.
        </Alert>
      </Paper>
    </Container>
  );
};
