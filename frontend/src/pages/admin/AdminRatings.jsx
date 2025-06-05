import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Alert,
    Stack, TextField, Divider, List, ListItem,
    ListItemIcon, ListItemText, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Button, Select, MenuItem, FormControl, InputLabel, IconButton, InputAdornment, Rating, Tooltip, Chip, Avatar, Modal, Snackbar
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Work as WorkIcon,
    Schedule as ScheduleIcon,
    EventNote as EventNoteIcon,
    Receipt as ReceiptIcon,
    Star as StarIcon,
    Spa as SpaIcon,
    Search as SearchIcon,
    AccountCircle as AccountCircleIcon,
    Notifications as NotificationsIcon,
    Visibility as VisibilityIcon,
    Store as StoreIcon,
    RateReview as RateReviewIcon,
    Close as CloseIcon,
    PhotoCamera as PhotoCameraIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';

// Importamos estilos generales del dashboard y crearemos estilos específicos
import '../../styles/AdminDashboard.css';
// import '../../styles/AdminRatings.css'; // TODO: Crear y usar este archivo para estilos específicos

const AdminRatings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userData, updateUserData } = useAuth();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedBarber, setSelectedBarber] = useState('');
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [peluqueria, setPeluqueria] = useState(null);
    const [peluqueriaError, setPeluqueriaError] = useState(null);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [adminProfile, setAdminProfile] = useState({
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
    const [avatarKey, setAvatarKey] = useState(0);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const BASE_BACKEND_URL = 'http://localhost:8080';

    // TODO: Obtener la lista de peluqueros para el dropdown
    const dummyBarbers = [
        { id: '', nombre: 'Todos los peluqueros' },
        { id: 1, nombre: 'Juan Pérez' },
        { id: 2, nombre: 'María García' },
    ];

    // TODO: Obtener las valoraciones según los filtros
    const fetchRatings = async () => {
        setLoading(true);
        setError(null);
        try {
            // Aquí iría la llamada a la API para obtener las valoraciones
            // console.log('Filtrando desde', startDate, 'hasta', endDate, 'para peluquero', selectedBarber);
            
            // Datos dummy por ahora
            const dummyRatings = [
                { id: 1, fecha: '2023-10-26', cliente: 'Cliente Uno', peluquero: 'Juan Pérez', puntuacion: 5, comentario: 'Excelente servicio de corte!' },
                { id: 2, fecha: '2023-10-25', cliente: 'Cliente Dos', peluquero: 'María García', puntuacion: 4, comentario: 'Buen tinte, aunque un poco caro.' },
                { id: 3, fecha: '2023-10-25', cliente: 'Cliente Uno', peluquero: 'Juan Pérez', puntuacion: 5, comentario: '' }, // Sin comentario
                { id: 4, fecha: '2023-10-24', cliente: 'Cliente Tres', peluquero: 'María García', puntuacion: 3, comentario: 'El tiempo de espera fue largo.' },
                { id: 5, fecha: '2023-10-24', cliente: 'Cliente Cuatro', peluquero: 'Juan Pérez', puntuacion: 5, comentario: 'Muy profesional y rápido.' },
            ];

            // Simular un retardo de red
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Filtrar datos dummy (implementación básica)
            const filteredRatings = dummyRatings.filter(rating => {
                const ratingDate = dayjs(rating.fecha);
                const start = startDate ? dayjs(startDate) : null;
                const end = endDate ? dayjs(endDate) : null;

                const dateFilter = (!start || ratingDate.isAfter(start.subtract(1, 'day'))) &&
                                   (!end || ratingDate.isBefore(end.add(1, 'day')));

                const barberFilter = selectedBarber === '' || rating.peluquero === dummyBarbers.find(b => b.id === selectedBarber)?.nombre; // Comparar por nombre dummy

                return dateFilter && barberFilter;
            });

            setRatings(filteredRatings);

        } catch (err) {
            console.error('Error fetching ratings:', err);
            setError('Error al cargar las valoraciones.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRatings();
        if (userData?.peluqueria) {
            setPeluqueria(userData.peluqueria);
        }
    }, [userData]);

    const handleFilterClick = () => {
        fetchRatings();
    };

    // Función para truncar comentarios largos
    const truncateComment = (comment, maxLength) => {
        if (!comment) return '—'; // Mostrar guion si no hay comentario
        if (comment.length <= maxLength) return comment;
        return comment.substring(0, maxLength) + '...';
    };

    // Definición de los elementos del sidebar
    const sidebarItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Peluqueros', icon: <WorkIcon />, path: '/admin/barbers-services' },
        { text: 'Servicios', icon: <SpaIcon />, path: '/admin/barbers-services?tab=servicios' }, // Enlazar a la pestaña de servicios
        { text: 'Horarios', icon: <ScheduleIcon />, path: '/admin/schedules' },
        { text: 'Facturación', icon: <ReceiptIcon />, path: '/admin/invoices' },
        { text: 'Valoraciones', icon: <StarIcon />, path: '/admin/ratings', active: true }, // Marcado como activo
    ];

    // Funciones del modal de perfil
    const handleOpenProfileModal = () => {
        setAdminProfile({
            nombreCompleto: userData?.nombre || '',
            correoElectronico: userData?.email || '',
            password: '',
            imagenPerfilUrl: userData?.imagenPerfilUrl || null,
            nuevaImagenPerfil: null,
            idUsuario: userData?.id // Añadir el ID del usuario
        });
        fetchAdminProfile();
        setOpenProfileModal(true);
    };

    const handleCloseProfileModal = () => {
        setOpenProfileModal(false);
        setValidationErrors({ nombreCompleto: '', correoElectronico: '', password: '', imagenPerfil: '' });
        setImagePreview(null);
        if (userData) {
            setAdminProfile({
                nombreCompleto: userData.nombre || '',
                correoElectronico: userData.email || '',
                password: '',
                imagenPerfilUrl: userData.imagenPerfilUrl || null,
                nuevaImagenPerfil: null,
                idUsuario: userData.id
            });
        }
    };

    const fetchAdminProfile = async () => {
        setLoadingProfile(true);
        setProfileError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No hay token de autenticación");

            const response = await fetch(`${BASE_BACKEND_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                    return;
                }
                throw new Error('Error al cargar el perfil');
            }

            const profileData = await response.json();
            setAdminProfile({
                nombreCompleto: profileData.nombre || '',
                correoElectronico: profileData.email || '',
                password: '',
                imagenPerfilUrl: profileData.imagenPerfilUrl || null,
                nuevaImagenPerfil: null,
                idUsuario: profileData.id
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
            setProfileError(err.message || 'Error al cargar el perfil');
        } finally {
            setLoadingProfile(false);
        }
    };

    const validateForm = () => {
        const errors = { nombreCompleto: '', correoElectronico: '', password: '', imagenPerfil: '' };
        let isValid = true;

        if (!adminProfile.nombreCompleto.trim()) {
            errors.nombreCompleto = 'El nombre es requerido';
            isValid = false;
        }

        if (!adminProfile.correoElectronico.trim()) {
            errors.correoElectronico = 'El correo electrónico es requerido';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(adminProfile.correoElectronico)) {
            errors.correoElectronico = 'El correo electrónico no es válido';
            isValid = false;
        }

        if (adminProfile.password && adminProfile.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setAdminProfile(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setValidationErrors(prev => ({ ...prev, imagenPerfil: 'La imagen no debe superar los 5MB' }));
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setAdminProfile(prev => ({ ...prev, nuevaImagenPerfil: file }));
            };
            reader.readAsDataURL(file);
            setValidationErrors(prev => ({ ...prev, imagenPerfil: '' }));
        }
    };

    const handleRemoveImage = () => {
        setAdminProfile(prevState => ({
            ...prevState,
            nuevaImagenPerfil: null,
            imagenPerfilUrl: null
        }));
        setImagePreview(null);
    };

    const handleSaveChanges = async () => {
        if (!validateForm()) {
            return;
        }

        setLoadingProfile(true);
        setProfileError(null);
        try {
            // Guardar el correo anterior antes de la actualización
            const correoAnterior = userData.email;

            const formData = new FormData();
            formData.append('nombre', adminProfile.nombreCompleto);
            formData.append('email', adminProfile.correoElectronico);
            if (adminProfile.password) {
                formData.append('password', adminProfile.password);
            }
            if (adminProfile.nuevaImagenPerfil) {
                formData.append('imagen', adminProfile.nuevaImagenPerfil);
            }
            
            // Add flag to remove image if imagenPerfilUrl is null and no new image is selected
            if (adminProfile.imagenPerfilUrl === null && !adminProfile.nuevaImagenPerfil) {
                 formData.append('eliminarImagen', 'true');
            }

            const response = await fetch(`${BASE_BACKEND_URL}/api/usuarios/${adminProfile.idUsuario}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el perfil');
            }

            const data = await response.json();

            console.log('Respuesta del backend al guardar perfil:', data);

            // Verificar si el email ha cambiado
            const emailHaCambiado = correoAnterior !== adminProfile.correoElectronico;
            
            if (emailHaCambiado) {
                // Si el email cambió, el backend devolverá un nuevo token
                if (data.token) {
                    // Actualizar el token y mostrar mensaje de éxito
                    localStorage.setItem("token", data.token);
                    setSnackbar({
                        open: true,
                        message: "Tu correo electrónico ha sido actualizado. La sesión ha sido renovada automáticamente.",
                        severity: 'success'
                    });
                } else {
                    // Si por alguna razón no recibimos el token, forzar logout
                    localStorage.removeItem("token");
                    setSnackbar({
                        open: true,
                        message: "Tu correo electrónico ha sido actualizado. Por seguridad, debes volver a iniciar sesión.",
                        severity: 'warning' // Usar warning o error si es necesario re-loggear
                    });
                    window.location.href = "/login"; // Redirigir después de mostrar el Snackbar
                    return; // Salir de la función
                }
            } else {
                // Si no cambió el email, solo mostrar mensaje de éxito
                setSnackbar({
                    open: true,
                    message: "Perfil actualizado correctamente",
                    severity: 'success'
                });
            }

            // Actualizar el contexto y cerrar el modal
            updateUserData({ ...userData, ...data });

            handleCloseProfileModal();
            
            // Increment key to force Avatar re-render
            setAvatarKey(prevKey => prevKey + 1);
            
        } catch (err) {
            console.error('Error saving admin profile:', err);
            setProfileError('Error al guardar los cambios. Por favor, intente nuevamente.');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Funciones del Snackbar
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box className="admin-dashboard-container"> {/* Contenedor principal */}
            {/* Sidebar */}
            <motion.Box 
                className="admin-dashboard-sidebar" 
                initial={{ x: -250 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
                sx={{ position: 'relative', height: '100%' }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box>
                        <Box className="sidebar-logo-container"> 
                            <img src="/logo.png" alt="Logo" className="sidebar-logo" /> 
                        </Box>
                        <Divider sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
                        <List>
                            {sidebarItems.map((item, index) => (
                                 <ListItem
                                    button
                                    key={item.text}
                                    component={Link}
                                    to={item.path}
                                    // Si la ruta actual coincide con la del item, o si el item está marcado como activo\n // usamos location.pathname para comparar solo la ruta base, ignorando query params
                                    sx={{
                                        /* Estilos de item */
                                        '&.active': { /* Estilo para el item activo */
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            borderLeft: '4px solid #d72a3c', // Indicador rojo activo
                                            paddingLeft: '16px' // Ajustar padding por el borde
                                        },
                                        // Determinar si el item está activo basado en la ruta actual
                                        color: (location.pathname === item.path.split('?')[0] || item.active) ? '#fff' : 'rgba(255, 255, 255, 0.8)', // Color de texto
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            color: '#d72a3c' // Color rojo al pasar el ratón
                                        },
                                        /* Asegurar que el padding sea consistente si no está activo */
                                        ...(!(location.pathname === item.path.split('?')[0] || item.active) && { paddingLeft: '20px' })
                                    }}
                                 >
                                    <ListItemIcon sx={{ color: (location.pathname === item.path.split('?')[0] || item.active) ? '#fff' : 'rgba(255, 255, 255, 0.8)' }}>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} sx={{ color: (location.pathname === item.path.split('?')[0] || item.active) ? '#fff' : 'rgba(255, 255, 255, 0.8)' }} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    <Button
                        onClick={handleLogout}
                        sx={{
                            mt: 'auto',
                            mb: 2,
                            mx: 2,
                            backgroundColor: '#d72a3c',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#b71c1c',
                            },
                            borderRadius: '8px',
                            textTransform: 'none',
                            py: 1
                        }}
                        startIcon={<LogoutIcon />}
                    >
                        Cerrar sesión
                    </Button>
                </Box>
            </motion.Box>

            {/* Main Content Area */}
            <Box className="admin-dashboard-main-content"> 
                {/* Topbar */}
                <Box className="admin-dashboard-topbar"> 
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Valoraciones</Typography>
                    <Box className="topbar-right"> 
                        {/* Nombre de la Peluquería */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mr: 2,
                            minWidth: '200px',
                            justifyContent: 'flex-end'
                        }}>
                            {peluqueriaError ? (
                                <Typography 
                                    variant="body2" 
                                    color="error" 
                                    sx={{ 
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}
                                >
                                    <StoreIcon fontSize="small" />
                                    {peluqueriaError}
                                </Typography>
                            ) : peluqueria ? (
                                <Chip
                                    icon={<StoreIcon />}
                                    label={peluqueria.nombre}
                                    sx={{
                                        backgroundColor: 'rgba(215, 42, 60, 0.3)',
                                        color: '#d72a3c',
                                        '& .MuiChip-icon': {
                                            color: '#d72a3c'
                                        },
                                        fontWeight: 'medium',
                                        fontSize: '0.9rem'
                                    }}
                                />
                            ) : (
                                <CircularProgress size={20} sx={{ color: '#d72a3c' }} />
                            )}
                        </Box>
                        <IconButton 
                            color="inherit" 
                            onClick={handleOpenProfileModal}
                            sx={{ 
                                p: 0.5,
                                '&:hover': { 
                                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            <Avatar
                                src={userData?.imagenPerfilUrl ? `${BASE_BACKEND_URL}${userData.imagenPerfilUrl}?t=${Date.now()}` : undefined}
                                sx={{ 
                                    width: 32, 
                                    height: 32,
                                    bgcolor: '#d72a3c',
                                    fontSize: '1rem'
                                }}
                            >
                                {userData?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Box>

                <Divider />

                {/* Content Area below Topbar */}
                <Box className="admin-dashboard-content-area" sx={{ bgcolor: '#fff', p: 3, borderRadius: 2, mt: 3 }}> {/* Contenedor principal con fondo blanco */}
                    {/* Encabezado del módulo */}
                    <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                        <RateReviewIcon sx={{ fontSize: 40, color: '#d72a3c' }} />
                        <Box>
                            <Typography variant="h6" gutterBottom>Gestión de Valoraciones</Typography>
                            <Typography variant="body2" color="text.secondary">Consulta y analiza las valoraciones de tus clientes sobre los peluqueros.</Typography>
                        </Box>
                    </Stack>

                    {/* Zona de Filtros */}
                    <Grid container spacing={2} alignItems="center" mb={3}>
                        <Grid item xs={12} md={3}>
                             <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                                <DatePicker
                                    label="Fecha Inicio"
                                    value={startDate}
                                    onChange={(newValue) => setStartDate(newValue)}
                                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                                <DatePicker
                                    label="Fecha Fin"
                                    value={endDate}
                                    onChange={(newValue) => setEndDate(newValue)}
                                    renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                                />
                            </LocalizationProvider>
                        </Grid>
                         <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Peluquero</InputLabel>
                                <Select
                                    value={selectedBarber}
                                    label="Peluquero"
                                    onChange={(event) => setSelectedBarber(event.target.value)}
                                >
                                    {dummyBarbers.map(barber => (
                                        <MenuItem key={barber.id} value={barber.id}>{barber.nombre}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                             <Button 
                                variant="contained" 
                                sx={{ bgcolor: '#d72a3c', '&:hover': { bgcolor: '#b0212e' }, height: '100%' }} // Ajustar altura
                                fullWidth // Opcional: hacer que el botón ocupe todo el ancho en móviles
                                onClick={handleFilterClick}
                            >
                                Filtrar
                            </Button>
                        </Grid>
                         {/* TODO: Añadir contador de valoraciones filtradas opcional */}
                    </Grid>

                    {/* Tabla de Resultados */}
                    {loading ? (
                         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
                    ) : ratings.length === 0 ? (
                         <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                            No se han encontrado valoraciones para estos filtros.\n                    </Typography>
                    ) : (
                         <TableContainer component={Paper} elevation={1}> {/* Añadimos un poco de elevación */}
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Peluquero</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Puntuación</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Comentario</TableCell>
                                         {/* TODO: Añadir columna de Acciones si es necesario */}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {ratings.map((rating) => (
                                        <TableRow key={rating.id}>
                                            <TableCell>{dayjs(rating.fecha).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell>{rating.cliente}</TableCell>
                                            <TableCell>{rating.peluquero}</TableCell>
                                            <TableCell>
                                                <Rating name="read-only" value={rating.puntuacion} readOnly precision={0.5} />
                                            </TableCell>
                                            <TableCell>
                                                {/* TODO: Implementar tooltip para comentario completo */}
                                                <Tooltip title={rating.comentario || 'Sin comentario'} arrow>
                                                    <Typography variant="body2">{truncateComment(rating.comentario, 50)}</Typography> {/* Truncar a 50 caracteres */}
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             {/* TODO: Implementar paginación y ordenación si es necesario */}
                        </TableContainer>
                    )}


                </Box>

                {/* Modal de Perfil */}
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
                                    <CloseIcon />
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
                                                <Avatar
                                                    src={imagePreview || (adminProfile.imagenPerfilUrl ? `${BASE_BACKEND_URL}${adminProfile.imagenPerfilUrl}` : undefined)}
                                                    sx={{ width: '100%', height: '100%', bgcolor: '#d72a3c', fontSize: '3rem' }}
                                                >
                                                    {adminProfile.nombreCompleto?.charAt(0)?.toUpperCase() || 'A'}
                                                </Avatar>
                                                <IconButton
                                                    size="small"
                                                    sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', boxShadow: 1 }}
                                                    component="label"
                                                >
                                                    <input type="file" hidden accept="image/jpeg,image/png" onChange={handleImageUpload} />
                                                    <PhotoCameraIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                            {(imagePreview || adminProfile.imagenPerfilUrl) && (
                                                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={handleRemoveImage}>
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
                                            value={adminProfile.nombreCompleto}
                                            onChange={handleProfileInputChange}
                                            error={!!validationErrors.nombreCompleto}
                                            helperText={validationErrors.nombreCompleto}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Correo electrónico"
                                            name="correoElectronico"
                                            type="email"
                                            value={adminProfile.correoElectronico}
                                            onChange={handleProfileInputChange}
                                            error={!!validationErrors.correoElectronico}
                                            helperText={validationErrors.correoElectronico}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Nueva contraseña (opcional)"
                                            name="password"
                                            type="password"
                                            value={adminProfile.password}
                                            onChange={handleProfileInputChange}
                                            error={!!validationErrors.password}
                                            helperText={validationErrors.password}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon />
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
                                        >
                                            Guardar Cambios
                                        </Button>
                                    </Stack>
                                </form>
                            )}
                        </Box>
                    </motion.div>
                </Modal>

                {/* Snackbar para notificaciones */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default AdminRatings; 