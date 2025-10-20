import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Paper, Typography, Box } from '@mui/material';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  position?: LatLngExpression;
  addressText?: string;
}

// Component to update map view when position changes
const MapUpdater: React.FC<{ position: LatLngExpression }> = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 15);
  }, [position, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  position = [45.4642, 9.1900], // Default to Milan
  addressText,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Mappa
      </Typography>
      <Box sx={{ height: 400, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater position={position} />
          <Marker position={position}>
            <Popup>
              {addressText || 'Posizione selezionata'}
            </Popup>
          </Marker>
        </MapContainer>
      </Box>
    </Paper>
  );
};
