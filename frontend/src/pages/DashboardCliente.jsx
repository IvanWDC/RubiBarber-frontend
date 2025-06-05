import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Paper, Snackbar, IconButton, Avatar, Modal, Stack, TextField, InputAdornment, Alert, CircularProgress } from '@mui/material';
import { ContentCut, Face, Palette, Wash, AllInclusive, CalendarToday, LocationOn, Close, PhotoCamera, Delete, Person, Email, Lock, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardCliente.css';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Nuevas opciones para filtrar/visualizar peluquerías
const opcionesVisualizacionPeluquerias = [
  { key: 'Todas', label: 'Todas las Peluquerías' },
  { key: 'MejoresValoraciones', label: 'Peluquerías con mejores valoraciones' },
  { key: 'MasVisitadas', label: 'Peluquerías Más Visitadas' },
];

const DashboardCliente = () => {
  const [opcionVisualizacionSeleccionada, setOpcionVisualizacionSeleccionada] = useState('Todas');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const navigate = useNavigate();
  const { userData, updateUserData, logout } = useAuth();

  // Nuevos estados para el modal de perfil
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [clientProfile, setClientProfile] = useState({
      nombreCompleto: '',
      correoElectronico: '',
      password: '',
      imagenPerfilUrl: null,
      nuevaImagenPerfil: null,
      idUsuario: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
      nombreCompleto: '',
      correoElectronico: '',
      password: '',
      imagenPerfil: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [avatarKey, setAvatarKey] = useState(0); // Para forzar re-render del avatar

  // Nuevos estados para peluquerías
  const [peluquerias, setPeluquerias] = useState([]);
  const [loadingPeluquerias, setLoadingPeluquerias] = useState(false);
  const [errorPeluquerias, setErrorPeluquerias] = useState(null);

  const BASE_BACKEND_URL = 'http://localhost:8080'; // Asegúrate de que esta URL sea correcta

  // Función para cargar peluquerías
  const fetchPeluquerias = async () => {
      setLoadingPeluquerias(true);
      setErrorPeluquerias(null);
      try {
          // Asumiendo un endpoint para listar peluquerías
          const response = await fetch(`${BASE_BACKEND_URL}/api/peluquerias`, {
               headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });

          if (!response.ok) {
              throw new Error('Error al cargar peluquerías');
          }

          const data = await response.json();
          setPeluquerias(data);

      } catch (err) {
          console.error('Error fetching peluquerias:', err);
          setErrorPeluquerias(err.message || 'Error al cargar peluquerías');
      } finally {
          setLoadingPeluquerias(false);
      }
  };

  // Llamar a fetchPeluquerias al cargar el componente
  useEffect(() => {
      fetchPeluquerias();
  }, []); // Array de dependencias vacío para que se ejecute solo una vez al montar el componente

  // Función para filtrar/seleccionar peluquerías según la opción de visualización
  const getPeluqueriasMostradas = () => {
      if (opcionVisualizacionSeleccionada === 'MejoresValoraciones') {
          return peluquerias.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (opcionVisualizacionSeleccionada === 'MasVisitadas') {
          return peluquerias.slice().sort((a, b) => (b.visitedCount || 0) - (a.visitedCount || 0));
      } else {
          return peluquerias;
      }
  };

  // Funciones del modal de perfil (adaptadas de AdminSchedules.jsx)
  const handleOpenProfileModal = () => {
    // Inicializar el estado del perfil con los datos actuales del usuario del contexto
    setClientProfile({
        nombreCompleto: userData?.nombre || '',
        correoElectronico: userData?.email || '',
        password: '', // No cargamos la contraseña por seguridad
        imagenPerfilUrl: userData?.imagenPerfilUrl || null,
        nuevaImagenPerfil: null,
        idUsuario: userData?.id // Usar el ID del usuario del contexto
    });
    fetchClientProfile(); // Opcional: cargar datos frescos del backend si es necesario
    setOpenProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setOpenProfileModal(false);
    // Limpiar errores y previsualización al cerrar
    setValidationErrors({ nombreCompleto: '', correoElectronico: '', password: '', imagenPerfil: '' });
    setImagePreview(null);
    // Opcional: restablecer clientProfile a los datos del contexto al cerrar si no se guardaron cambios
    if (userData) {
        setClientProfile({
            nombreCompleto: userData.nombre || '',
            correoElectronico: userData.email || '',
            password: '',
            imagenPerfilUrl: userData.imagenPerfilUrl || null,
            nuevaImagenPerfil: null,
            idUsuario: userData.id
        });
    }
  };

  const fetchClientProfile = async () => {
      setLoadingProfile(true);
      setProfileError(null);
      try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No hay token de autenticación");

          // Endpoint para obtener los datos del propio usuario autenticado
          const response = await fetch(`${BASE_BACKEND_URL}/api/auth/me`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) {
              if (response.status === 401) {
                  // Si el token no es válido, redirigir al login
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                  return;
              }
              throw new Error('Error al cargar el perfil');
          }

          const profileData = await response.json();

          // Asegúrate de que el ID se mapea correctamente, como hicimos en AdminSchedules
          setClientProfile(prev => ({
              ...prev,
              nombreCompleto: profileData.nombre || '',
              correoElectronico: profileData.email || '',
              // No actualizamos la contraseña aquí
              imagenPerfilUrl: profileData.imagenPerfilUrl || null,
              idUsuario: profileData.id // Usar profileData.id que viene del backend
          }));

      } catch (err) {
          console.error('Error fetching client profile:', err);
          setProfileError(err.message || 'Error al cargar el perfil');
      } finally {
          setLoadingProfile(false);
      }
  };

  const validateForm = () => {
      const errors = { nombreCompleto: '', correoElectronico: '', password: '', imagenPerfil: '' };
      let isValid = true;

      if (!clientProfile.nombreCompleto.trim()) {
          errors.nombreCompleto = 'El nombre es requerido';
          isValid = false;
      }

      if (!clientProfile.correoElectronico.trim()) {
          errors.correoElectronico = 'El correo electrónico es requerido';
          isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(clientProfile.correoElectronico)) {
          errors.correoElectronico = 'El correo electrónico no es válido';
          isValid = false;
      }

      // La contraseña es opcional, solo validar si se ingresó algo
      if (clientProfile.password && clientProfile.password.length < 6) {
          errors.password = 'La contraseña debe tener al menos 6 caracteres';
          isValid = false;
      }

      setValidationErrors(errors);
      return isValid;
  };

  const handleProfileInputChange = (e) => {
      const { name, value } = e.target;
      setClientProfile(prev => ({ ...prev, [name]: value }));
      // Limpiar el error de validación al modificar el campo
      if (validationErrors[name]) {
          setValidationErrors(prev => ({ ...prev, [name]: '' }));
      }
  };

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          // Validar tamaño del archivo (ej. 5MB)
          if (file.size > 5 * 1024 * 1024) {
              setValidationErrors(prev => ({ ...prev, imagenPerfil: 'La imagen no debe superar los 5MB' }));
              return;
          }

          // Mostrar previsualización de la imagen
          const reader = new FileReader();
          reader.onloadend = () => {
              setImagePreview(reader.result);
              setClientProfile(prev => ({ ...prev, nuevaImagenPerfil: file })); // Guardar el objeto File
          };
          reader.readAsDataURL(file);
          setValidationErrors(prev => ({ ...prev, imagenPerfil: '' })); // Limpiar error si se selecciona una imagen válida
      }
  };

  const handleRemoveImage = () => {
      setClientProfile(prevState => ({
          ...prevState,
          nuevaImagenPerfil: null, // Eliminar la nueva imagen seleccionada
          imagenPerfilUrl: null // Indicar que la imagen existente debe eliminarse en el backend
      }));
      setImagePreview(null); // Limpiar la previsualización
  };

  const handleSaveChanges = async () => {
      if (!validateForm()) {
          // Si la validación falla, detener el proceso de guardado
          return;
      }

      setLoadingProfile(true);
      setProfileError(null);
      try {
          // Guardar el correo anterior antes de la actualización para verificar si cambió
          const correoAnterior = userData?.email; // Usar userData del contexto

          const formData = new FormData();
          formData.append('nombre', clientProfile.nombreCompleto);
          formData.append('email', clientProfile.correoElectronico);
          if (clientProfile.password) {
              formData.append('password', clientProfile.password); // Solo añadir si hay una nueva contraseña
          }
          if (clientProfile.nuevaImagenPerfil) {
              formData.append('imagen', clientProfile.nuevaImagenPerfil); // Añadir el archivo de imagen si se seleccionó uno nuevo
          }

          // Añadir flag para eliminar la imagen si imagenPerfilUrl es null y no se seleccionó nueva imagen
          if (clientProfile.imagenPerfilUrl === null && !clientProfile.nuevaImagenPerfil) {
               formData.append('eliminarImagen', 'true');
          }

          // Endpoint PUT para actualizar el perfil del usuario (cliente en este caso)
          const response = await fetch(`${BASE_BACKEND_URL}/api/usuarios/${clientProfile.idUsuario}`, { // Usar clientProfile.idUsuario
              method: 'PUT',
              body: formData,
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`, // Enviar token en la cabecera
              }
          });

          if (!response.ok) {
              // Intentar leer el mensaje de error del backend si está disponible
              let errorMsg = 'Error al actualizar el perfil';
               try {
                   const errorJson = await response.json();
                   errorMsg = errorJson.message || errorMsg; // Usar el mensaje del backend si existe
               } catch (jsonError) {
                   console.error('Failed to parse error response:', jsonError); // Loguear si falla parsear el JSON
               }
               throw new Error(errorMsg);
          }

          const data = await response.json();

          console.log('Respuesta del backend al guardar perfil del cliente:', data);

          // Verificar si el email ha cambiado
          const emailHaCambiado = correoAnterior !== clientProfile.correoElectronico;

          if (emailHaCambiado) {
              // Si el email cambió, el backend debería devolver un nuevo token
              if (data.token) {
                  // Actualizar el token en localStorage
                  localStorage.setItem("token", data.token);
                  // Mostrar mensaje de éxito (email actualizado y sesión renovada)
                  setSnackbarMsg("Tu correo electrónico ha sido actualizado. La sesión ha sido renovada automáticamente.");
                  setSnackbarOpen(true);
              } else {
                  // Si no se recibe un nuevo token, forzar logout por seguridad
                  localStorage.removeItem("token");
                  setSnackbarMsg("Tu correo electrónico ha sido actualizado. Por seguridad, debes volver a iniciar sesión.");
                  setSnackbarOpen(true);
                  // Esperar un breve momento para que el usuario vea el Snackbar antes de redirigir
                   setTimeout(() => { window.location.href = "/login"; }, 3000);
                  return; // Salir de la función
              }
          } else {
              // Si el email no cambió, solo mostrar mensaje de éxito de perfil actualizado
              setSnackbarMsg("Perfil actualizado correctamente");
    setSnackbarOpen(true);
          }

          // Actualizar el contexto global del usuario con los nuevos datos
          // Asegúrate de mapear el 'id' del backend a 'idUsuario' si es necesario, similar a fetchClientProfile
          updateUserData({ ...userData, ...data, idUsuario: data.id }); // Asumiendo que el backend devuelve 'id'

          // Cerrar el modal después de guardar exitosamente
          handleCloseProfileModal();

          // Incrementar key para forzar re-render del Avatar en la cabecera (si existe)
          setAvatarKey(prevKey => prevKey + 1);

      } catch (err) {
          console.error('Error saving client profile:', err);
          // Mostrar mensaje de error al usuario
          setProfileError(err.message || 'Error al guardar los cambios. Por favor, intente nuevamente.');
      } finally {
          setLoadingProfile(false); // Ocultar indicador de carga
      }
  };

  return (
    <Box className="dashboard-nuevo-container">
      {/* Cabecera */}
      <Box className="dashboard-nuevo-header">
        <Box className="dashboard-nuevo-logo-circle">
          <img src="/logo.png" alt="Rubí Barber" className="dashboard-nuevo-logo" />
        </Box>
        {/* Contenedor para alinear verticalmente Mis Citas y el icono de perfil */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          className="dashboard-nuevo-citas-btn"
              startIcon={<CalendarToday sx={{ color: 'black' }} />}
          onClick={() => navigate('/cliente/mis-citas')}
        >
          Mis Citas
        </Button>
            {/* Icono/Avatar de perfil para abrir el modal */}
            <IconButton
                color="inherit"
                onClick={handleOpenProfileModal}
                sx={{
                    p: 0.5,
                    ml: 1, // Margen izquierdo para separar del botón de citas
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
            >
                <Avatar
                    key={avatarKey} // Usar key para forzar re-render al actualizar imagen
                    src={userData?.imagenPerfilUrl ? `${BASE_BACKEND_URL}${userData.imagenPerfilUrl}?t=${Date.now()}` : undefined}
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#d72a3c', // Color de fondo si no hay imagen
                        fontSize: '1rem'
                    }}
                >
                    {userData?.nombre?.charAt(0)?.toUpperCase() || 'C'} {/* Inicial del nombre del usuario */}
                </Avatar>
            </IconButton>
            {/* Icono de Cerrar Sesión */}
            <IconButton
                onClick={logout}
                sx={{
                    color: '#fff', // Color del icono blanco
                    ml: 1, // Margen a la izquierda para separar del avatar
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                }}
                size="medium"
            >
                <Logout /> {/* Icono de Logout */}
            </IconButton>
        </Box>
      </Box>

      {/* Hero */}
      <Box className="dashboard-nuevo-hero" sx={{ gap: { xs: 2, md: 3 } }}>
        <Typography variant="h3" className="dashboard-nuevo-hero-title" style={{ fontWeight: 900 }}>
          Reserva tu Cita en un Clic
        </Typography>
        <Button
          className="dashboard-nuevo-mapa-btn"
          startIcon={<LocationOn sx={{ color: 'black' }} />}
          onClick={() => navigate('/cliente/mapa')}
        >
          Ver en mapa
        </Button>

      </Box>

      {/* Categorías */}
      <Box className="dashboard-nuevo-categorias">
        {opcionesVisualizacionPeluquerias.map((cat) => (
          <Button
            key={cat.key}
            className={`dashboard-nuevo-categoria-btn${opcionVisualizacionSeleccionada === cat.key ? ' active' : ''}`}
            onClick={() => setOpcionVisualizacionSeleccionada(cat.key)}
          >
            {cat.label}
          </Button>
        ))}
      </Box>

      {/* Servicios */}
      <Grid container spacing={3} justifyContent="center" alignItems="stretch" className="dashboard-nuevo-servicios">
        {getPeluqueriasMostradas().map((peluqueria) => (
          <Grid item key={peluqueria.id} xs={12} sm={6} md={3} style={{ display: 'flex' }}>
            <Paper className="dashboard-nuevo-servicio-card" elevation={3}>
              {/* Imagen de la peluquería (Placeholder o real si está disponible) */}
              <Box className="dashboard-nuevo-servicio-icono">
                  {/* Si la peluqueria tiene imagen, usar img tag, sino un icono placeholder */}
                  {peluqueria.imagenUrl ? (
                      <img src={`${BASE_BACKEND_URL}${peluqueria.imagenUrl}`} alt={peluqueria.nombre} />
                  ) : (
                      <ContentCut sx={{ fontSize: 40 }} /> // Icono placeholder si no hay imagen
                  )}
              </Box>

              {/* Nombre de la Peluquería */}
              <Typography variant="h6" className="dashboard-nuevo-servicio-nombre">
                {peluqueria.nombre}
              </Typography>

              {/* Información adicional (Dirección, Rating - Placeholders o reales) */}
              {/* Reemplazar con datos reales si están disponibles en el objeto peluqueria */}
              <Typography variant="body2" className="dashboard-nuevo-servicio-detalle">
                  {peluqueria.direccion || 'Dirección no disponible'}
              </Typography>
              <Typography variant="body2" className="dashboard-nuevo-servicio-detalle" sx={{ mt: 0.5 }}>
                  Rating: {peluqueria.rating || 'Sin rating'} / 5
              </Typography>

              {/* Botón para ver detalles o reservar */}
              <Button
                fullWidth
                className="dashboard-nuevo-reserva-btn"
                onClick={() => navigate(`/cliente/reserva/${peluqueria.id}`)}
              >
                Reservar
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Modal de Perfil (copiado y adaptado de AdminSchedules.jsx) */}
      <Modal
          open={openProfileModal}
          onClose={handleCloseProfileModal}
          aria-labelledby="profile-modal-title"
      >
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
          >
              <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: { xs: '90%', sm: 400, md: 500 },
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  outline: 'none',
                  maxHeight: '90vh',
                  overflowY: 'auto',
              }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography id="profile-modal-title" variant="h6" component="h2">
                          Editar Perfil
                      </Typography>
                      <IconButton onClick={handleCloseProfileModal} size="small">
                          <Close />
                      </IconButton>
                  </Box>

                  {loadingProfile ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                          <CircularProgress size={40} sx={{ color: '#d72a3c' }} />
                      </Box>
                  ) : profileError ? (
                      <Alert severity="error" sx={{ mb: 2 }}>
                          {profileError}
                      </Alert>
                  ) : (
                      <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
                          <Stack spacing={3}>
                              {/* Imagen de perfil */}
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                                  <Box sx={{ position: 'relative', width: 120, height: 120, mb: 2 }}>
                                      {/* Usar clientProfile.imagenPerfilUrl y imagePreview */}
                                      <Avatar
                                          key={avatarKey} // Usar key para forzar re-render al actualizar imagen
                                          src={imagePreview || (clientProfile.imagenPerfilUrl ? `${BASE_BACKEND_URL}${clientProfile.imagenPerfilUrl}?t=${Date.now()}` : undefined)}
                                          sx={{ width: '100%', height: '100%', bgcolor: '#d72a3c', fontSize: '3rem' }}
                                      >
                                          {clientProfile.nombreCompleto?.charAt(0)?.toUpperCase() || 'C'} {/* Inicial del nombre del cliente */}
                                      </Avatar>
                                      <IconButton
                                          size="small"
                                          sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', boxShadow: 1 }}
                                          component="label"
                                      >
                                          <input type="file" hidden accept="image/jpeg,image/png" onChange={handleImageUpload} />
                                          <PhotoCamera />
                                      </IconButton>
                                  </Box>
                                  {(imagePreview || clientProfile.imagenPerfilUrl) && (
                                      <Button size="small" color="error" startIcon={<Delete />} onClick={handleRemoveImage}>
                                          Eliminar imagen
                                      </Button>
                                  )}
                                  {validationErrors.imagenPerfil && (
                                      <Typography color="error" variant="caption">{validationErrors.imagenPerfil}</Typography>
                                  )}
                              </Box>

                              {/* Campos del formulario */}
                              <TextField
                                  fullWidth
                                  label="Nombre completo"
                                  name="nombreCompleto"
                                  value={clientProfile.nombreCompleto}
                                  onChange={handleProfileInputChange}
                                  error={!!validationErrors.nombreCompleto}
                                  helperText={validationErrors.nombreCompleto}
                                  InputProps={{
                                      startAdornment: (
                                          <InputAdornment position="start">
                                              <Person />
                                          </InputAdornment>
                                      ),
                                  }}
                              />

                              <TextField
                                  fullWidth
                                  label="Correo electrónico"
                                  name="correoElectronico"
                                  type="email"
                                  value={clientProfile.correoElectronico}
                                  onChange={handleProfileInputChange}
                                  error={!!validationErrors.correoElectronico}
                                  helperText={validationErrors.correoElectronico}
                                  InputProps={{
                                      startAdornment: (
                                          <InputAdornment position="start">
                                              <Email />
                                          </InputAdornment>
                                      ),
                                  }}
                              />

                              <TextField
                                  fullWidth
                                  label="Nueva contraseña (opcional)"
                                  name="password"
                                  type="password"
                                  value={clientProfile.password}
                                  onChange={handleProfileInputChange}
                                  error={!!validationErrors.password}
                                  helperText={validationErrors.password}
                                  InputProps={{
                                      startAdornment: (
                                          <InputAdornment position="start">
                                              <Lock />
                                          </InputAdornment>
                                      ),
                                  }}
                              />

                              <Button
                                  type="submit"
                                  variant="contained"
                                  fullWidth
                                  size="large"
                                  sx={{ mt: 2, bgcolor: '#d72a3c', '&:hover': { bgcolor: '#b51f2e' } }}
                                  disabled={loadingProfile}
                              >
                                  {loadingProfile ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
                              </Button>
                          </Stack>
                      </form>
                  )}
              </Box>
          </motion.div>
      </Modal>

      {/* Snackbar (copiado y adaptado de AdminSchedules.jsx) */}
      <Snackbar
        open={snackbarOpen}
          autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarMsg.includes('Error') || snackbarMsg.includes('debes volver a iniciar sesión') ? 'error' : 'success'} sx={{ width: '100%' }}>
              {snackbarMsg}
          </Alert>
      </Snackbar>

    </Box>
  );
};

export default DashboardCliente;
