import React, { useState, useMemo } from 'react';
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
  Button,
  Collapse,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  NetworkCheck as NetworkIcon,
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  Euro as EuroIcon,
  ContactMail as ContactMailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useConfig } from '../../hooks/useCoverage';
import type { CoverageService } from '../../types/api';

interface WidgetCoverageResultsProps {
  services: CoverageService[];
}

/**
 * Widget-optimized coverage results component
 * Shows best coverage prominently with AGCOM badges
 */
export const WidgetCoverageResults: React.FC<WidgetCoverageResultsProps> = ({ services }) => {
  const [showOthers, setShowOthers] = useState(false);
  const { data: config } = useConfig();
  const visibleColumns = config?.profileTable?.visibleColumns || ['description', 'speed', 'provider', 'monthlyCost', 'activationCost'];

  // Sort services by download speed (descending)
  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => b.downloadSpeed - a.downloadSpeed);
  }, [services]);

  const bestService = sortedServices[0];
  const otherServices = sortedServices.slice(1);

  // Determine AGCOM badge based on service name and technology
  const getAgcomBadge = (service: CoverageService) => {
    // Check both name and technology for FTTH (case insensitive)
    const nameUpper = service.name.toUpperCase();
    const technologyUpper = service.technology.toUpperCase();
    const isFTTH = nameUpper.includes('FTTH') || technologyUpper.includes('FTTH');

    return {
      src: isFTTH ? '/icons/ftth.png' : '/icons/fttc.png',
      alt: isFTTH ? 'Copertura FTTH - Fibra fino a casa' : 'Copertura FTTC - Fibra fino al cabinet',
    };
  };

  const handleRequestInfo = () => {
    window.open('https://www.tuogreen.it/contatti/', '_blank', 'noopener,noreferrer');
  };

  if (services.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          Nessun servizio disponibile per questo indirizzo.
        </Alert>
      </Paper>
    );
  }

  const agcomBadge = getAgcomBadge(bestService);

  return (
    <Box>
      {/* Best Coverage - Highlighted */}
      <Card
        sx={{
          border: '4px solid #75ae22',
          backgroundColor: '#f5faf0',
          boxShadow: '0 4px 20px rgba(117, 174, 34, 0.2)',
          mb: 3,
        }}
      >
        <CardContent sx={{ pb: 2 }}>
          {/* Header with service name and AGCOM badge */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: '#444444', mb: 1 }}>
                {bestService.name}
              </Typography>
              <Chip
                label="Migliore Copertura"
                sx={{
                  backgroundColor: '#75ae22',
                  color: '#fff',
                  fontWeight: 600,
                }}
                size="medium"
              />
            </Box>
            {/* AGCOM Badge */}
            <Box
              component="img"
              src={agcomBadge.src}
              alt={agcomBadge.alt}
              sx={{
                width: 80,
                height: 80,
                objectFit: 'contain',
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Technology and Speed Information */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <NetworkIcon sx={{ mr: 1, color: '#75ae22', fontSize: 28 }} />
                <Typography variant="body1" color="#444444" sx={{ mr: 1 }}>
                  Tecnologia:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#444444' }}>
                  {bestService.technology}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <DownloadIcon sx={{ mr: 1, color: '#75ae22', fontSize: 28 }} />
                <Typography variant="body1" color="#444444" sx={{ mr: 1 }}>
                  Download:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#75ae22' }}>
                  {bestService.downloadSpeed} Mbps
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <UploadIcon sx={{ mr: 1, color: '#75ae22', fontSize: 28 }} />
                <Typography variant="body1" color="#444444" sx={{ mr: 1 }}>
                  Upload:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#75ae22' }}>
                  {bestService.uploadSpeed} Mbps
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Connection Element */}
          {bestService.connectionElement && (
            <Typography variant="body2" color="#444444" sx={{ mb: 2, fontStyle: 'italic' }}>
              Centrale di connessione: {bestService.connectionElement}
            </Typography>
          )}

          {/* Speed Profiles Accordion */}
          {bestService.profiles && bestService.profiles.length > 0 && (
            <Accordion
              sx={{
                boxShadow: 'none',
                '&:before': { display: 'none' },
                border: '1px solid #75ae22',
                mb: 2,
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedIcon fontSize="small" sx={{ color: '#75ae22' }} />
                  <Typography variant="body1" fontWeight={600} color="#444444">
                    {bestService.profiles.length} Profili di velocità disponibili
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
                      {bestService.profiles.map((profile) => (
                        <TableRow key={profile.id} hover>
                          {visibleColumns.includes('description') && (
                            <TableCell>
                              <Typography variant="body2" fontWeight={500} color="#444444">
                                {profile.description}
                              </Typography>
                            </TableCell>
                          )}
                          {visibleColumns.includes('speed') && (
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight={500} color="#444444">
                                {profile.downloadSpeed}↓ / {profile.uploadSpeed}↑
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Mbps
                              </Typography>
                            </TableCell>
                          )}
                          {visibleColumns.includes('provider') && (
                            <TableCell align="center">
                              <Chip label={profile.providerName} size="small" variant="outlined" />
                            </TableCell>
                          )}
                          {visibleColumns.includes('monthlyCost') && (
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                <EuroIcon fontSize="small" color="action" />
                                <Typography variant="body2" fontWeight={500} color="#444444">
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
                                <Typography variant="body2" color="#444444">
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
          )}

          {/* CTA Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<ContactMailIcon />}
            onClick={handleRequestInfo}
            sx={{
              backgroundColor: '#75ae22',
              color: '#fff',
              fontWeight: 600,
              py: 1.5,
              '&:hover': {
                backgroundColor: '#5d8b1b',
              },
            }}
          >
            Richiedi Informazioni
          </Button>
        </CardContent>
      </Card>

      {/* Other Coverage - Collapsible */}
      {otherServices.length > 0 && (
        <Box>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setShowOthers(!showOthers)}
            startIcon={showOthers ? <VisibilityOffIcon /> : <VisibilityIcon />}
            sx={{
              mb: 2,
              borderColor: '#444444',
              color: '#444444',
              '&:hover': {
                borderColor: '#75ae22',
                backgroundColor: 'rgba(117, 174, 34, 0.04)',
              },
            }}
          >
            {showOthers ? 'Nascondi' : 'Vedi'} altre coperture ({otherServices.length})
          </Button>

          <Collapse in={showOthers}>
            <Paper sx={{ p: 2, backgroundColor: '#fafafa' }}>
              <Typography variant="h6" gutterBottom color="#444444">
                Altre Coperture Disponibili
              </Typography>
              <Grid container spacing={2}>
                {otherServices.map((service) => {
                  const otherAgcomBadge = getAgcomBadge(service);
                  return (
                    <Grid item xs={12} md={6} key={service.serviceId}>
                      <Card
                        sx={{
                          height: '100%',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <CardContent>
                          {/* Service name, status, and AGCOM badge */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" component="h3" color="#444444" sx={{ mb: 1 }}>
                                {service.name}
                              </Typography>
                              <Chip
                                label={service.available ? 'Disponibile' : 'Non disponibile'}
                                color={service.available ? 'success' : 'default'}
                                size="small"
                              />
                            </Box>
                            {/* AGCOM Badge - smaller */}
                            <Box
                              component="img"
                              src={otherAgcomBadge.src}
                              alt={otherAgcomBadge.alt}
                              sx={{
                                width: 60,
                                height: 60,
                                objectFit: 'contain',
                              }}
                            />
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          {/* Technology */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <NetworkIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="body2" color="#444444">
                              Tecnologia: <strong>{service.technology}</strong>
                            </Typography>
                          </Box>

                          {/* Download */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <DownloadIcon sx={{ mr: 1, color: 'success.main' }} />
                            <Typography variant="body2" color="#444444">
                              Download: <strong>{service.downloadSpeed} Mbps</strong>
                            </Typography>
                          </Box>

                          {/* Upload */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <UploadIcon sx={{ mr: 1, color: 'info.main' }} />
                            <Typography variant="body2" color="#444444">
                              Upload: <strong>{service.uploadSpeed} Mbps</strong>
                            </Typography>
                          </Box>

                          {/* Connection Element */}
                          {service.connectionElement && (
                            <>
                              <Divider sx={{ my: 2 }} />
                              <Typography variant="caption" color="text.secondary">
                                Centrale: {service.connectionElement}
                              </Typography>
                            </>
                          )}

                          {/* Profiles accordion for other services */}
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
                                      {service.profiles.length} Profili disponibili
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
                  );
                })}
              </Grid>
            </Paper>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};
