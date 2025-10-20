import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  NetworkCheck as NetworkIcon,
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  Euro as EuroIcon,
} from '@mui/icons-material';
import { useConfig } from '../../hooks/useCoverage';
import type { CoverageService } from '../../types/api';

interface CoverageResultsProps {
  services: CoverageService[];
}

export const CoverageResults: React.FC<CoverageResultsProps> = ({ services }) => {
  const { data: config } = useConfig();
  const visibleColumns = config?.profileTable?.visibleColumns || ['description', 'speed', 'provider', 'monthlyCost', 'activationCost'];

  if (services.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          Nessun servizio disponibile per questo indirizzo.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Servizi Disponibili
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Trovati {services.length} servizi disponibili per l'indirizzo selezionato
      </Typography>

      <Grid container spacing={2}>
        {services.map((service) => (
          <Grid item xs={12} md={6} lg={4} key={service.serviceId}>
            <Card
              sx={{
                height: '100%',
                border: service.available ? '2px solid' : '1px solid',
                borderColor: service.available ? 'success.main' : 'divider',
              }}
            >
              <CardContent>
                {/* Service name and status */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h3">
                    {service.name}
                  </Typography>
                  <Chip
                    label={service.available ? 'Disponibile' : 'Non disponibile'}
                    color={service.available ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Technology */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <NetworkIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Tecnologia:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                    {service.technology}
                  </Typography>
                </Box>

                {/* Download speed */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <DownloadIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Download:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                    {service.downloadSpeed} Mbps
                  </Typography>
                </Box>

                {/* Upload speed */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <UploadIcon sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Upload:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                    {service.uploadSpeed} Mbps
                  </Typography>
                </Box>

                {/* Additional info */}
                {service.connectionElement && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary">
                      Centrale: {service.connectionElement}
                    </Typography>
                  </>
                )}

                {/* Profiles accordion */}
                {service.profiles && service.profiles.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Accordion
                      sx={{
                        boxShadow: 'none',
                        '&:before': { display: 'none' },
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ px: 2 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SpeedIcon fontSize="small" color="primary" />
                          <Typography variant="body2" fontWeight={500}>
                            {service.profiles.length} Profili di velocità disponibili
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                {visibleColumns.includes('description') && <TableCell>Profilo</TableCell>}
                                {visibleColumns.includes('speed') && <TableCell align="center">Velocità</TableCell>}
                                {visibleColumns.includes('provider') && <TableCell align="center">Provider</TableCell>}
                                {visibleColumns.includes('monthlyCost') && <TableCell align="right">Canone</TableCell>}
                                {visibleColumns.includes('activationCost') && <TableCell align="right">Attivazione</TableCell>}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {service.profiles.map((profile) => (
                                <TableRow
                                  key={profile.id}
                                  hover
                                  sx={{ '&:last-child td': { border: 0 } }}
                                >
                                  {visibleColumns.includes('description') && (
                                    <TableCell>
                                      <Typography variant="body2" fontWeight={500}>
                                        {profile.description}
                                      </Typography>
                                    </TableCell>
                                  )}
                                  {visibleColumns.includes('speed') && (
                                    <TableCell align="center">
                                      <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                          {profile.downloadSpeed}↓ / {profile.uploadSpeed}↑
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          Mbps
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                  )}
                                  {visibleColumns.includes('provider') && (
                                    <TableCell align="center">
                                      <Chip
                                        label={profile.providerName}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                  )}
                                  {visibleColumns.includes('monthlyCost') && (
                                    <TableCell align="right">
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <EuroIcon fontSize="small" color="action" />
                                        <Typography variant="body2" fontWeight={500}>
                                          {profile.monthlyCost.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          /mese
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                  )}
                                  {visibleColumns.includes('activationCost') && (
                                    <TableCell align="right">
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <EuroIcon fontSize="small" color="action" />
                                        <Typography variant="body2">
                                          {profile.activationCost.toFixed(2)}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
