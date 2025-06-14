import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress, Snackbar, IconButton, Button, TextField } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import '../styles/MapaPeluquerias.css';
import '../styles/MisCitasCliente.css';
import L from 'leaflet';
import { LocationOn, Close, Star, Refresh, CommentOutlined } from '@mui/icons-material';
import API from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';

// Icono personalizado para peluquerías
const markerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Icono personalizado para la posición del usuario
const userMarkerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png', // Default blue marker
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapaPeluquerias = () => {
  const [peluquerias, setPeluquerias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState('');
  const [userPos, setUserPos] = useState(null);
  const [selectedPeluqueria, setSelectedPeluqueria] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const mapRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPos([latitude, longitude]);
        fetchPeluquerias(latitude, longitude);
      },
      () => {
        setSnackbar('No se pudo obtener tu ubicación.');
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (selectedPeluqueria && mapRef.current) {
      mapRef.current.setView([selectedPeluqueria.latitud, selectedPeluqueria.longitud], 16);
    }
  }, [selectedPeluqueria]);

  const fetchPeluquerias = async (lat, lng) => {
    try {
      const res = await API.get(`/peluquerias/cercanas?lat=${lat}&lng=${lng}&radio=10`);
      setPeluquerias(res.data);
    } catch (err) {
      setSnackbar('Error al cargar las peluquerías.');
    } finally {
      setLoading(false);
    }
  };

  const handlePeluqueriaClick = (peluqueria) => {
    setSelectedPeluqueria(peluqueria);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPeluquerias = peluquerias.filter(peluqueria =>
    peluqueria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    peluqueria.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to refresh user location and barber shops
  const handleRefreshLocation = () => {
    setLoading(true); // Show loading indicator while refreshing
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPos([latitude, longitude]);
        fetchPeluquerias(latitude, longitude);
      },
      () => {
        setSnackbar('No se pudo actualizar tu ubicación.');
        setLoading(false);
      }
    );
  };

  const handleReservar = (peluqueria) => {
    navigate(`/cliente/reserva/${peluqueria.id}`);
  };

  return (
    <Box className="mapa-main-container">
      <Box className="mis-citas-header">
        <Box
          className="mis-citas-logo-circle"
          sx={{
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 },
            transition: 'opacity 0.3s ease',
          }}
          onClick={() => navigate('/cliente/dashboard')}
        >
          <img src="/logo.png" alt="Rubí Barber" className="mis-citas-logo" />
        </Box>
        <Typography variant="h4" className="mis-citas-title">
          Mapa de Peluquerías
        </Typography>
      </Box>

      <Box className="mapa-content-area">
        <Box className="mapa-sidebar">
          <Typography variant="h5" gutterBottom className="mapa-sidebar-title">Peluquerías Cercanas</Typography>
          
          {loading ? (
            <Box className="mapa-loading-sidebar"><CircularProgress /></Box>
          ) : (
            <AnimatePresence>
              {filteredPeluquerias.length === 0 ? (
                <motion.div
                  key="no-peluquerias"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mapa-no-results"
                >
                  <Typography align="center" color="text.secondary">No se encontraron peluquerías.</Typography>
                </motion.div>
              ) : (
                filteredPeluquerias.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <Box
                      className="mapa-peluqueria-item"
                      sx={{
                        bgcolor: selectedPeluqueria?.id === p.id ? '#eeeeee' : 'transparent',
                        transition: 'background-color 0.3s ease',
                        '&:hover': { bgcolor: '#f0f0f0' },
                      }}
                    >
                      <Box onClick={() => handlePeluqueriaClick(p)}>
                        <Typography variant="subtitle1" className="mapa-peluqueria-name">{p.nombre}</Typography>
                        <Typography variant="body2" color="text.secondary" className="mapa-peluqueria-address">{p.direccion}</Typography>
                        <Box className="mapa-peluqueria-details">
                          <Typography variant="body2" color="text.secondary" className="mapa-peluqueria-distance">
                            {p.distancia !== null && p.distancia !== undefined ? 
                              p.distancia < 1 ? 
                                `${Math.round(p.distancia * 1000)} m` : 
                                `${p.distancia.toFixed(1)} km`
                              : 'N/A'
                            }
                          </Typography>
                          <Box className="mapa-peluqueria-rating">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} sx={{ color: i < p.puntuacion ? '#ffb400' : '#e0e0e0', fontSize: '1rem' }} />
                            ))}
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                              {p.puntuacion ? p.puntuacion.toFixed(1) : 'Sin rating'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<LocationOn />}
                        onClick={() => handleReservar(p)}
                          sx={{ width: 'calc(50% - 5px)' }}
                      >
                        Reservar
                      </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          startIcon={<CommentOutlined />}
                          onClick={() => navigate(`/cliente/comentarios/${p.id}`)}
                          sx={{ width: 'calc(50% - 5px)' }}
                        >
                          Comentarios
                        </Button>
                      </Box>
                    </Box>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          )}
        </Box>

        <Box className="mapa-map-area">
          {!userPos ? (
            <Box className="mapa-loading"><CircularProgress /></Box>
          ) : (
            <MapContainer
              center={userPos}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              whenCreated={mapInstance => { mapRef.current = mapInstance; } }
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* User Location Marker */}
              {userPos && (
                <Marker position={userPos} icon={userMarkerIcon}>
                  <Popup>Tu ubicación</Popup>
                </Marker>
              )}

              {/* Barber Shop Markers */}
              {filteredPeluquerias.map((p) => (
                <Marker
                  key={p.id}
                  position={[p.latitud, p.longitud]}
                  icon={markerIcon}
                >
                  <Popup>
                    <Box className="mapa-popup-content">
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>{p.nombre}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{p.direccion}</Typography>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<LocationOn />}
                        onClick={() => handleReservar(p)}
                        sx={{ width: '100%' }}
                      >
                        Reservar
                      </Button>
                    </Box>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </Box>
      </Box>

      <Box className="mapa-footer">
        {/* Contenedor para el filtro de búsqueda (alineado con el sidebar) */}
        <Box className="mapa-footer-search-area">
          <Typography variant="subtitle2" sx={{ color: 'white', marginBottom: '5px' }}>
            Buscar Peluquería:
          </Typography>
          <TextField
            className="mapa-search-input"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              style: {
                color: 'white',
              },
            }}
          />
        </Box>

        {/* Contenedor para el botón de actualizar ubicación (alineado con el mapa) */}
        <Box className="mapa-footer-update-area">
        <Button
          variant="contained"
            color="primary"
            size="small"
          startIcon={<Refresh />}
          onClick={handleRefreshLocation}
            disabled={loading} // Deshabilitar durante la carga
        >
            ACTUALIZAR UBICACIÓN
        </Button>
        </Box>
      </Box>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3500}
        onClose={() => setSnackbar('')}
        message={snackbar}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSnackbar('')}>
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default MapaPeluquerias;
