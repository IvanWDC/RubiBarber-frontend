import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, List, ListItem, ListItemIcon, ListItemText, TextField, InputAdornment, IconButton, Paper, Grid, Modal, Stack, Button, CircularProgress, Alert, Chip, Avatar } from '@mui/material';
import { motion } from 'framer-motion'; // Importar motion
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Work as WorkIcon,
    Schedule as ScheduleIcon,
    EventNote as EventNoteIcon,
    Receipt as ReceiptIcon,
    Star as StarIcon,
    AccountCircle as AccountCircleIcon,
    Spa as SpaIcon,
    Store as StoreIcon,
    Close as CloseIcon,
    PhotoCamera as PhotoCameraIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Asumiendo que usas react-router-dom para navegación
import { Bar } from 'react-chartjs-2'; // Importar componente de gráfica de barras
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'; // Importar elementos necesarios de Chart.js
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';
import '../../styles/AdminDashboard.css';
import API from '../../api/client';

// Registrar los elementos de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Placeholder para datos de widgets (luego vendrán del backend)
const dummyWidgetData = {
    citasHoy: 15,
    ingresosSemanales: 1250.75,
    peluquerosActivos: 8
};

// Placeholder para datos de últimas reservas (luego vendrán del backend)
const dummyLatestReservations = [
    { id: 1, cliente: 'Juan Pérez', fecha: '2023-10-27 10:00', servicio: 'Corte Caballero' },
    { id: 2, cliente: 'María García', fecha: '2023-10-27 11:30', servicio: 'Tinte y Mechas' },
    { id: 3, cliente: 'Carlos Ruiz', fecha: '2023-10-27 14:00', servicio: 'Afeitado Clásico' },
    { id: 4, cliente: 'Ana López', fecha: '2023-10-27 15:30', servicio: 'Peinado y Maquillaje' },
];

// Placeholder para datos de gráfica (luego vendrán del backend)
const dummyMonthlyAppointments = [
    { month: 'Ene', citas: 200 },
    { month: 'Feb', citas: 220 },
    { month: 'Mar', citas: 250 },
    { month: 'Abr', citas: 230 },
    { month: 'May', citas: 280 },
    { month: 'Jun', citas: 300 },
    { month: 'Jul', citas: 270 },
    { month: 'Ago', citas: 260 },
    { month: 'Sep', citas: 290 },
    { month: 'Oct', citas: 310 },
    { month: 'Nov', citas: 300 },
    { month: 'Dic', citas: 320 },
];

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userData, setUserData, updateUserData } = useAuth();
    const [widgetData, setWidgetData] = useState(dummyWidgetData);
    const [latestReservations, setLatestReservations] = useState(dummyLatestReservations);
    const [monthlyAppointments, setMonthlyAppointments] = useState(dummyMonthlyAppointments);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [peluqueria, setPeluqueria] = useState(null);
    const [peluqueriaError, setPeluqueriaError] = useState(null);

    // Añadir estado para notificaciones
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Nuevos estados para los datos del perfil del administrador
    const [adminProfile, setAdminProfile] = useState({
        nombreCompleto: '',
        correoElectronico: '',
        password: '', // Nueva contraseña (opcional)
        imagenPerfilUrl: null,
        nuevaImagenPerfil: null,
    });
    
    // Estado para forzar la actualización del Avatar
    const [avatarKey, setAvatarKey] = useState(0);

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [profileError, setProfileError] = useState(null);

    // Estados para validación
    const [validationErrors, setValidationErrors] = useState({
        nombreCompleto: '',
        correoElectronico: '',
        password: '',
        imagenPerfil: ''
    });

    // Estado para el preview de la imagen
    const [imagePreview, setImagePreview] = useState(null);

    // Configuración para la gráfica de barras
    const chartData = {
        labels: monthlyAppointments.map(data => data.month),
        datasets: [
            {
                label: 'Número de Citas',
                data: monthlyAppointments.map(data => data.citas),
                backgroundColor: 'rgba(215, 42, 60, 0.6)', // Color rojo principal con transparencia
                borderColor: 'rgba(215, 42, 60, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Citas Mensuales',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Número de Citas',
                },
            },
            x: {
                 title: {
                    display: true,
                    text: 'Mes',
                },
            },
        },
    };

    // Constante para la URL base del backend
    const BASE_BACKEND_URL = 'http://localhost:8080';

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Simular carga de datos de resumen
            await new Promise(resolve => setTimeout(resolve, 500));
            setWidgetData({
                citasHoy: 25,
                ingresosSemanales: 500.75,
                peluquerosActivos: 12
            });
            setLoading(false);

            // Simular carga de citas recientes
            await new Promise(resolve => setTimeout(resolve, 600));
            const dummyAppointments = [
                { id: 1, cliente: 'Cliente Ejemplo 1', fechaHora: dayjs().subtract(1, 'hour').toDate(), servicio: 'Corte de pelo', peluquero: 'Juan Pérez', estado: 'Completada' },
                { id: 2, cliente: 'Cliente Ejemplo 2', fechaHora: dayjs().add(2, 'hours').toDate(), servicio: 'Barba', peluquero: 'María García', estado: 'Pendiente' },
                { id: 3, cliente: 'Cliente Ejemplo 3', fechaHora: dayjs().subtract(3, 'days').toDate(), servicio: 'Tinte', peluquero: 'Juan Pérez', estado: 'Cancelada' },
            ];
            setLatestReservations(dummyAppointments);

            // Simular carga de servicios más demandados
            await new Promise(resolve => setTimeout(resolve, 700));
            const dummyTopServices = [
                { id: 1, nombre: 'Corte de pelo', vecesReservado: 120 },
                { id: 2, nombre: 'Barba', vecesReservado: 80 },
                { id: 3, nombre: 'Tinte', vecesReservado: 50 },
            ];
            setMonthlyAppointments(dummyTopServices);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Error al cargar los datos del dashboard.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (userData?.peluqueria) {
            setPeluqueria(userData.peluqueria);
        }
    }, [userData]);

    // Funciones para abrir y cerrar el modal de perfil
    const handleOpenProfileModal = () => {
        // Inicializar el estado del perfil con valores por defecto seguros
        setAdminProfile({
            nombreCompleto: userData?.nombre || '',
            correoElectronico: userData?.email || '',
            password: '',
            imagenPerfilUrl: userData?.imagenPerfilUrl || null,
            nuevaImagenPerfil: null,
        });
        fetchAdminProfile();
        setOpenProfileModal(true);
    };
    const handleCloseProfileModal = () => {
        setOpenProfileModal(false);
        setValidationErrors({
            nombreCompleto: '',
            correoElectronico: '',
            password: '',
            imagenPerfil: ''
        });
        setImagePreview(null);
        // Resetear el estado del perfil a los datos actuales
        if (userData) {
            setAdminProfile({
                nombreCompleto: userData.nombre || '',
                correoElectronico: userData.email || '',
                password: '',
                imagenPerfilUrl: userData.imagenPerfilUrl || null,
                nuevaImagenPerfil: null
            });
        }
    };

    // TODO: Implementar carga de datos del perfil del administrador
    const fetchAdminProfile = async () => {
        setLoadingProfile(true);
        setProfileError(null);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No hay token de autenticación");
            }

            const response = await fetch(`${BASE_BACKEND_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token inválido o expirado
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                    return;
                }
                throw new Error('Error al cargar el perfil');
            }

            const profileData = await response.json();
            console.log('Datos del perfil obtenidos:', profileData);
            setAdminProfile({
                idUsuario: profileData.id,
                nombreCompleto: profileData.nombre || '',
                correoElectronico: profileData.email || '',
                password: '',
                imagenPerfilUrl: profileData.imagenPerfilUrl || null,
                nuevaImagenPerfil: null
            });

            console.log('adminProfile state after fetch:', adminProfile);

            // Actualizar el contexto global asegurando que tenga idUsuario
            updateUserData({ ...profileData, idUsuario: profileData.id });

            // Solo mostrar error si no se pudo obtener el email (dato crítico)
            if (!profileData.email) {
                setProfileError('No se pudo cargar la información del perfil.');
            }

            // Devuelve los datos cargados
            return profileData;
        } catch (error) {
            console.error('Error al cargar el perfil del admin:', error);
            // Solo mostrar error si no tenemos datos del perfil
            if (!adminProfile?.correoElectronico) {
                setProfileError('No se pudo cargar la información del perfil.');
            }
        } finally {
            setLoadingProfile(false);
        }
    };

    // Función para validar el formulario
    const validateForm = () => {
        const errors = {};
        let isValid = true;

        // Validar nombre
        if (!adminProfile.nombreCompleto.trim()) {
            errors.nombreCompleto = 'El nombre es obligatorio';
            isValid = false;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(adminProfile.correoElectronico)) {
            errors.correoElectronico = 'Email inválido';
            isValid = false;
        }

        // Validar contraseña (solo si se ha modificado)
        if (adminProfile.password && adminProfile.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
            isValid = false;
        }

        // Validar imagen (si se ha seleccionado una nueva)
        if (adminProfile.nuevaImagenPerfil) {
            const file = adminProfile.nuevaImagenPerfil;
            const validTypes = ['image/jpeg', 'image/png'];
            const maxSize = 2 * 1024 * 1024; // 2MB

            if (!validTypes.includes(file.type)) {
                errors.imagenPerfil = 'Solo se permiten imágenes PNG o JPG';
                isValid = false;
            }
            if (file.size > maxSize) {
                errors.imagenPerfil = 'La imagen no debe superar 2MB';
                isValid = false;
            }
        }

        setValidationErrors(errors);
        return isValid;
    };

    // Función para manejar cambios en los campos
    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setAdminProfile(prevState => ({
            ...prevState,
            [name]: value,
        }));
        // Limpiar error de validación al modificar
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Función para manejar la subida de imagen
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo y tamaño
            const validTypes = ['image/jpeg', 'image/png'];
            const maxSize = 2 * 1024 * 1024; // 2MB

            if (!validTypes.includes(file.type)) {
                setValidationErrors(prev => ({
                    ...prev,
                    imagenPerfil: 'Solo se permiten imágenes PNG o JPG'
                }));
                return;
            }
            if (file.size > maxSize) {
                setValidationErrors(prev => ({
                    ...prev,
                    imagenPerfil: 'La imagen no debe superar 2MB'
                }));
                return;
            }

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Actualizar estado
            setAdminProfile(prevState => ({
                ...prevState,
                nuevaImagenPerfil: file
            }));
            setValidationErrors(prev => ({
                ...prev,
                imagenPerfil: ''
            }));
        }
    };

    // Función para eliminar la imagen
    const handleRemoveImage = () => {
        setAdminProfile(prevState => ({
            ...prevState,
            nuevaImagenPerfil: null,
            imagenPerfilUrl: null
        }));
        setImagePreview(null);
    };

    // Función para guardar cambios
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

    const sidebarItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard', active: true },
        { text: 'Peluqueros', icon: <WorkIcon />, path: '/admin/barbers-services' },
        { text: 'Servicios', icon: <SpaIcon />, path: '/admin/barbers-services?tab=servicios' },
        { text: 'Horarios', icon: <ScheduleIcon />, path: '/admin/schedules' },
        { text: 'Facturación', icon: <ReceiptIcon />, path: '/admin/invoices' },
        { text: 'Valoraciones', icon: <StarIcon />, path: '/admin/ratings' },
    ];

    // Función auxiliar para formatear fecha y hora (usada en citas recientes)
    const formatFechaHora = (fechaHora) => {
        return dayjs(fechaHora).format('DD/MM/YYYY HH:mm');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Box className="admin-dashboard-container">
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
                            {sidebarItems.map((item) => (
                                <ListItem
                                    button
                                    key={item.text}
                                    component={Link}
                                    to={item.path}
                                    sx={{
                                        '&.active': { /* Estilo para el item activo */ }
                                    }}
                                >
                                    <ListItemIcon sx={{ color: '#fff' }}>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} sx={{ color: '#fff' }} />
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
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
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
                        {console.log('userData.imagenPerfilUrl en Topbar:', userData?.imagenPerfilUrl)}
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
                                // Construct URL only if imagenPerfilUrl exists
                                src={userData?.imagenPerfilUrl ? `${BASE_BACKEND_URL}${userData.imagenPerfilUrl}?t=${Date.now()}` : undefined}
                                sx={{ 
                                    width: 32, 
                                    height: 32,
                                    bgcolor: '#d72a3c',
                                    fontSize: '1rem'
                                }}
                                key={avatarKey}
                            >
                                {userData?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Box>

                <Divider />

                {/* Content Area below Topbar */}
                <Box className="admin-dashboard-content-area">
                    {/* Widgets Resumen */}
                    <Grid container spacing={3} className="admin-dashboard-summary-widgets">
                        <Grid item sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h6" color="textSecondary">Citas Hoy</Typography>
                                <Typography variant="h4" color="primary" sx={{ mt: 1 }}>{widgetData.citasHoy}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h6" color="textSecondary">Ingresos Semanales</Typography>
                                <Typography variant="h4" color="success.main" sx={{ mt: 1 }}>${widgetData.ingresosSemanales.toFixed(2)}</Typography>
                            </Paper>
                        </Grid>
                        <Grid item sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h6" color="textSecondary">Peluqueros Activos</Typography>
                                <Typography variant="h4" color="primary" sx={{ mt: 1 }}>{widgetData.peluquerosActivos}</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Gráfica y Tabla */}
                    <Box className="admin-dashboard-bottom-section">
                        {/* Gráfica (60%) */}
                        <Box className="admin-dashboard-chart-area">
                            <Typography variant="h6" gutterBottom>Gráfica Citas Mensuales</Typography>
                            <Bar data={chartData} options={chartOptions} />
                        </Box>

                        {/* Tabla (40%) */}
                        <Box className="admin-dashboard-table-area">
                            <Typography variant="h6" gutterBottom>Últimas Reservas</Typography>
                            {/* Placeholder de Tabla - Aquí puedes usar un componente Table de MUI */}
                            <Box>
                                {/* Ejemplo básico de cómo podría ser la tabla con Box y Typography */}
                                {latestReservations.map(reservation => (
                                    <Box key={reservation.id} sx={{ 
                                        borderBottom: '1px solid #eee', 
                                        py: 1,
                                        '& .MuiTypography-root': {
                                            color: 'text.primary' // Asegura que el texto sea visible
                                        }
                                    }}>
                                        <Typography variant="body1" sx={{ color: 'text.primary' }}>
                                            <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Cliente:</Box> {reservation.cliente}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Fecha:</Box> {formatFechaHora(reservation.fechaHora)}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Servicio:</Box> {reservation.servicio}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Modal de Perfil del Administrador */}
            <Modal
                open={openProfileModal}
                onClose={handleCloseProfileModal}
                aria-labelledby="profile-modal-title"
                aria-describedby="profile-modal-description"
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
                            <Typography id="profile-modal-title" variant="h6" component="h2" sx={{ color: 'text.primary' }}>
                                Editar Perfil
                            </Typography>
                            <IconButton 
                                onClick={handleCloseProfileModal}
                                size="small"
                                sx={{ 
                                    color: 'text.secondary',
                                    '&:hover': { color: 'error.main' }
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        {loadingProfile ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress size={40} sx={{ color: '#d72a3c' }} />
                            </Box>
                        ) : profileError ? (
                            <Alert 
                                severity="error" 
                                sx={{ mb: 2 }}
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => setProfileError(null)}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </IconButton>
                                }
                            >
                                {profileError}
                            </Alert>
                        ) : (
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
                                <Stack spacing={3}>
                                    {/* Sección de imagen de perfil */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center',
                                        mb: 2 
                                    }}>
                                        <Box sx={{
                                            position: 'relative',
                                            width: 120,
                                            height: 120,
                                            mb: 2
                                        }}>
                                            <Avatar
                                                src={imagePreview || (adminProfile.imagenPerfilUrl ? `${BASE_BACKEND_URL}${adminProfile.imagenPerfilUrl}` : undefined)}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    bgcolor: '#d72a3c',
                                                    fontSize: '3rem'
                                                }}
                                                key={avatarKey}
                                            >
                                                {adminProfile.nombreCompleto?.charAt(0)?.toUpperCase() || 'A'}
                                            </Avatar>
                                            <IconButton
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    bgcolor: 'background.paper',
                                                    boxShadow: 1,
                                                    '&:hover': { bgcolor: 'grey.100' }
                                                }}
                                                component="label"
                                            >
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/jpeg,image/png"
                                                    onChange={handleImageUpload}
                                                />
                                                <PhotoCameraIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                        {(imagePreview || adminProfile.imagenPerfilUrl) && (
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={handleRemoveImage}
                                                sx={{ mt: 1 }}
                                            >
                                                Eliminar imagen
                                            </Button>
                                        )}
                                        {validationErrors.imagenPerfil && (
                                            <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                                                {validationErrors.imagenPerfil}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Campos del formulario */}
                                    <TextField
                                        label="Nombre Completo"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        name="nombreCompleto"
                                        value={adminProfile.nombreCompleto || ''}
                                        onChange={handleProfileInputChange}
                                        error={!!validationErrors.nombreCompleto}
                                        helperText={validationErrors.nombreCompleto}
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        label="Correo Electrónico"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        type="email"
                                        name="correoElectronico"
                                        value={adminProfile.correoElectronico || ''}
                                        onChange={handleProfileInputChange}
                                        error={!!validationErrors.correoElectronico}
                                        helperText={
                                            validationErrors.correoElectronico || 
                                            "⚠️ Si modificas tu correo electrónico, deberás volver a iniciar sesión"
                                        }
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        label="Nueva Contraseña (opcional)"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        type="password"
                                        name="password"
                                        value={adminProfile.password || ''}
                                        onChange={handleProfileInputChange}
                                        error={!!validationErrors.password}
                                        helperText={validationErrors.password || 'Dejar en blanco para mantener la contraseña actual'}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Stack>

                                <Box sx={{ 
                                    mt: 4, 
                                    display: 'flex', 
                                    justifyContent: 'flex-end', 
                                    gap: 2 
                                }}>
                                    <Button 
                                        onClick={handleCloseProfileModal}
                                        variant="outlined"
                                        sx={{ 
                                            borderColor: 'grey.400',
                                            color: 'text.secondary',
                                            '&:hover': {
                                                borderColor: 'grey.600',
                                                bgcolor: 'grey.50'
                                            }
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loadingProfile}
                                        sx={{ 
                                            bgcolor: '#d72a3c',
                                            '&:hover': { bgcolor: '#b0212e' },
                                            minWidth: 120
                                        }}
                                    >
                                        {loadingProfile ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            'Guardar Cambios'
                                        )}
                                    </Button>
                                </Box>
                            </form>
                        )}
                    </Box>
                </motion.div>
            </Modal>
        </Box>
    );
};

export default AdminDashboard; 