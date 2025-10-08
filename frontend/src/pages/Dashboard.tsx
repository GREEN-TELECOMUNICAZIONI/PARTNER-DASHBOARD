import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '../components/dashboard/DashboardCard';
import {
  Search as SearchIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Benvenuto nella Dashboard Partner
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Seleziona un'azione per iniziare
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DashboardCard
            title="Verifica Copertura"
            description="Controlla la disponibilità dei servizi TWT per un indirizzo specifico. Visualizza le tecnologie disponibili e le velocità offerte."
            icon={<SearchIcon />}
            buttonText="Verifica Copertura"
            onButtonClick={() => navigate('/verifica-copertura')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardCard
            title="Nuovo Contratto"
            description="Crea un nuovo contratto per un cliente. Questa funzionalità sarà disponibile a breve."
            icon={<DescriptionIcon />}
            buttonText="Nuovo Contratto"
            onButtonClick={() => navigate('/nuovo-contratto')}
            disabled={true}
          />
        </Grid>
      </Grid>
    </Container>
  );
};
