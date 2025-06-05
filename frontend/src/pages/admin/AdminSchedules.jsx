import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Select, MenuItem, FormControl, InputLabel, 
    Button, Paper, Grid, CircularProgress, Alert, Card, CardContent,
    Stack, TextField, IconButton, Divider, List, ListItem, 
    ListItemIcon, ListItemText, Switch, FormControlLabel, Chip, Avatar, Modal, InputAdornment, Snackbar
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Work as WorkIcon,
    Schedule as ScheduleIcon,
    EventNote as EventNoteIcon,
    Receipt as ReceiptIcon,
    Star as StarIcon,
    Spa as SpaIcon,
    Save as SaveIcon,
    AccessTime as AccessTimeIcon,
    Store as StoreIcon,
    AccountCircle as AccountCircleIcon,
    Close as CloseIcon,
    PhotoCamera as PhotoCameraIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import '../../styles/AdminDashboard.css';
import '../../styles/AdminSchedules.css';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Horas de ejemplo para los selectores (puedes ajustar según el horario de la peluquería)
const timeOptions = [];
for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) { // Intervalos de 30 minutos
        const hour = i.toString().padStart(2, '0');
        const minute = j.toString().padStart(2, '0');
        timeOptions.push(`${hour}:${minute}`);
    }
}

const AdminSchedules = () => {
    const location = useLocation();
    const { userData, updateUserData } = useAuth();
    const [peluqueros, setPeluqueros] = useState([]);
    const [selectedPeluquero, setSelectedPeluquero] = useState('');
    const [schedule, setSchedule] = useState({}); // { Lunes: { start: '09:00', end: '18:00' }, Martes: {...} }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [selectedPeluqueroName, setSelectedPeluqueroName] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
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
    const navigate = useNavigate();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const BASE_BACKEND_URL = 'http://localhost:8080';

    // TODO: Implementar useEffect para cargar la lista de peluqueros del admin
    useEffect(() => {
        const fetchPeluqueros = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No se encontró token de autenticación.");
                }

                const response = await fetch(`${BASE_BACKEND_URL}/api/peluquero`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    // Manejar errores HTTP, por ejemplo, si el admin no tiene peluquería asociada
                    if (response.status === 404) {
                         // No hay peluqueros asociados a este admin (peluquería no encontrada o sin peluqueros)
                         setPeluqueros([]);
                         setLoading(false);
                         console.warn("No se encontraron peluqueros para esta peluquería.");
                         return;
                    }
                    throw new Error(`Error al cargar los peluqueros: ${response.statusText}`);
                }

                const responseJson = await response.json();
                setPeluqueros(responseJson);
                setLoading(false);

            } catch (err) {
                console.error('Error fetching barbers:', err);
                // Muestra un mensaje de error al usuario si es necesario, o solo loguea
                // setError('Error al cargar los peluqueros.'); // Puedes descomentar esto si quieres mostrar el error en la UI
                setPeluqueros([]); // Asegúrate de que la lista esté vacía en caso de error
                setLoading(false);
            }
        };

        fetchPeluqueros();
        // La dependencia userData?.peluqueria no es necesaria si la API ya filtra por el admin autenticado
    }, [userData?.id]); // Dependencia en userData.id para recargar si cambia el admin

    useEffect(() => {
        if (userData?.peluqueria) {
            setPeluqueria(userData.peluqueria);
        }
    }, [userData]); // Dependencia en userData para actualizar si cambia el usuario o su peluquería

    // Cargar el horario del peluquero seleccionado cuando cambie
    useEffect(() => {
            const fetchSchedule = async () => {
            if (!selectedPeluquero) {
                // Cargar horario por defecto si no hay peluquero seleccionado
                setSchedule(getDefaultSchedule());
                setLoading(false);
                return; // Salir si no hay peluquero seleccionado
            }

                    setLoading(true);
            setError(null); // Limpiar errores previos
            
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No se encontró token de autenticación.");
                }

                // *** LLAMADA AL NUEVO ENDPOINT PARA OBTENER EL HORARIO SEMANAL COMPLETO ***
                const response = await fetch(`${BASE_BACKEND_URL}/api/horarios/semanal/peluquero/${selectedPeluquero}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                     if (response.status === 404) {
                         // Si no hay horario para este peluquero en la BD (es nuevo), cargar el horario por defecto
                         setSchedule(getDefaultSchedule());
                    setLoading(false);
                         console.warn("No se encontró horario semanal para el peluquero seleccionado. Cargando horario por defecto.");
                         return;
                    }
                    throw new Error(`Error al cargar el horario semanal: ${response.statusText}`);
                }

                const backendScheduleMap = await response.json(); // Esperamos un mapa como respuesta

                // Mapear el mapa de Horario del backend al estado del frontend
                const mappedSchedule = {};
                daysOfWeek.forEach(day => {
                    const dayData = backendScheduleMap[day]; // Obtener los datos para el día del mapa
                    mappedSchedule[day] = {
                        available: dayData?.available ?? false, // Usar 'available' del DTO
                        start: dayData?.start || '',           // Usar 'start' del DTO
                        end: dayData?.end || '',             // Usar 'end' del DTO
                    };
                });
                
                // Asegurar que todos los días estén presentes en el estado, usando el default si falta alguno del backend
                 const finalSchedule = { ...getDefaultSchedule(), ...mappedSchedule };

                setSchedule(finalSchedule);
                    setLoading(false);

            } catch (err) {
                console.error('Error fetching schedule:', err);
                setError('Error al cargar el horario semanal. Intente de nuevo.');
                    setSchedule(getDefaultSchedule()); // Cargar horario por defecto en caso de error
                setLoading(false);
                }
            };

            fetchSchedule();
    }, [selectedPeluquero, peluqueros]); // Dependencia: recargar cuando cambie el peluquero seleccionado o la lista de peluqueros

    useEffect(() => {
        if (selectedPeluquero) {
            const peluquero = peluqueros.find(p => p.id === selectedPeluquero);
            setSelectedPeluqueroName(peluquero?.nombre || '');
        }
    }, [selectedPeluquero, peluqueros]);

    const getDefaultSchedule = () => {
        const defaultSchedule = {};
        daysOfWeek.forEach(day => {
            // Horario por defecto: 9:00 a 18:00 de Lunes a Viernes, fin de semana libre
            if (day !== 'Sábado' && day !== 'Domingo') {
                defaultSchedule[day] = { start: '09:00', end: '18:00' };
            } else {
                defaultSchedule[day] = { start: '', end: '' };
            }
        });
        return defaultSchedule;
    };

    const handlePeluqueroChange = (event) => {
        setSelectedPeluquero(event.target.value);
    };

    const handleScheduleChange = (day, type, value) => {
        setSchedule(prevSchedule => ({
            ...prevSchedule,
            [day]: { 
                ...prevSchedule[day], 
                [type]: value,
                available: prevSchedule[day]?.available ?? true
            }
        }));
    };

    const handleAvailabilityChange = (day, available) => {
        setSchedule(prevSchedule => ({
            ...prevSchedule,
            [day]: { 
                ...prevSchedule[day],
                available,
                start: available ? prevSchedule[day]?.start || '09:00' : '',
                end: available ? prevSchedule[day]?.end || '18:00' : ''
            }
        }));
    };

    const handleSaveSchedule = async () => {
        if (!selectedPeluquero) {
            setError('Por favor, selecciona un peluquero primero.');
            return;
        }

        // Validación de horarios
        for (const day of daysOfWeek) {
            const daySchedule = schedule[day];
            if (daySchedule?.available && daySchedule.start && daySchedule.end) {
                if (daySchedule.start >= daySchedule.end) {
                    setError(`La hora de inicio debe ser anterior a la hora de fin para el ${day}`);
                    return;
                }
            }
        }

        setSaving(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No se encontró token de autenticación.");
            }

            const response = await fetch(`${BASE_BACKEND_URL}/api/horarios/peluquero/${selectedPeluquero}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(schedule),
            });

            if (!response.ok) {
                 let errorMsg = 'Error al guardar el horario.';
                 try {
                     const errorJson = await response.json();
                     errorMsg = errorJson.message || errorMsg;
                 } catch (jsonError) {
                     console.error('Failed to parse error response:', jsonError);
                 }
                 throw new Error(errorMsg);
            }

            // Si es exitoso, mostrar mensaje de éxito
            setSnackbar({
                open: true,
                message: "Horario guardado correctamente",
                severity: 'success'
            });

        } catch (err) {
            console.error('Error saving schedule:', err);
            setError(err.message || 'Error al guardar el horario.');
             setSnackbar({
                 open: true,
                 message: err.message || 'Error al guardar el horario.',
                 severity: 'error'
             });
        } finally {
            setSaving(false);
        }
    };

    const handleCopyTemplate = () => {
        // TODO: Implementar la lógica para copiar plantilla
        alert('Funcionalidad "Copiar plantilla" pendiente de implementar.');
    };

    const sidebarItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Peluqueros', icon: <WorkIcon />, path: '/admin/barbers-services' },
        { text: 'Servicios', icon: <SpaIcon />, path: '/admin/barbers-services?tab=servicios' }, // Enlazar a la pestaña de servicios
        { text: 'Horarios', icon: <ScheduleIcon />, path: '/admin/schedules', active: true }, // Marcado como activo
        { text: 'Facturación', icon: <ReceiptIcon />, path: '/admin/invoices' },
        { text: 'Valoraciones', icon: <StarIcon />, path: '/admin/ratings' },
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
                                        '&.active': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            borderLeft: '4px solid #d72a3c',
                                            paddingLeft: '16px'
                                        },
                                        color: item.active ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            color: '#d72a3c'
                                        },
                                        ...(!item.active && { paddingLeft: '20px' })
                                    }}
                                >
                                    <ListItemIcon sx={{ color: item.active ? '#fff' : 'rgba(255, 255, 255, 0.8)' }}>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} sx={{ color: item.active ? '#fff' : 'rgba(255, 255, 255, 0.8)' }} />
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
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Gestión de Horarios</Typography>
                    <Box className="topbar-right">
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

                {/* Nuevo diseño de Horarios */}
                <Box className="admin-dashboard-content-area admin-schedules-content-area">
                    {/* Título y subtítulo */}
                    <Typography variant="h6" sx={{
                        color: '#ffffff',
                        mb: 4
                    }}>
                        Selecciona un peluquero y define su disponibilidad semanal
                    </Typography>

                    {/* Selector de Peluquero */}
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 3, 
                            mb: 4, 
                            borderRadius: '12px',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <FormControl fullWidth>
                            <InputLabel id="select-peluquero-label">Peluquero</InputLabel>
                                <Select
                                labelId="select-peluquero-label"
                                    value={selectedPeluquero}
                                    onChange={handlePeluqueroChange}
                                    label="Peluquero"
                                renderValue={(selectedId) => {
                                    const selected = peluqueros.find(p => p.id === selectedId);
                                    return selected ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar 
                                                sx={{ 
                                                    width: 32, 
                                                    height: 32,
                                                    bgcolor: '#d72a3c',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {selected.nombre?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                            <Typography>{selected.nombre}</Typography>
                                        </Box>
                                    ) : null;
                                }}
                            >
                                    {peluqueros.map((peluquero) => (
                                        <MenuItem key={peluquero.id} value={peluquero.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar 
                                                sx={{ 
                                                    width: 32, 
                                                    height: 32,
                                                    bgcolor: '#d72a3c',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {peluquero.nombre?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                            <Typography>{peluquero.nombre}</Typography>
                                        </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                    </Paper>

                    {/* Horarios del Peluquero */}
                                {selectedPeluquero && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                            <Typography variant="h6" sx={{
                                            mb: 3,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                color: '#ffffff'
                                                }}>
                                <EventNoteIcon sx={{ mr: 1 }} /> Disponibilidad semanal de {selectedPeluqueroName}
                                                </Typography>
                                                
                            <Grid container spacing={3}>
                                                    {daysOfWeek.map((day) => (
                                    <Grid item xs={12} sm={6} md={6} key={day}>
                                                            <Paper 
                                            elevation={3}
                                                                sx={{ 
                                                p: 3,
                                                borderRadius: '12px',
                                                backgroundColor: '#ffffff'
                                            }}
                                        >
                                            <Stack spacing={2}>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#d72a3c' }}>
                                                                        {day}
                                                                    </Typography>
                                                                    <FormControlLabel
                                                                        control={
                                                                            <Switch
                                                                checked={schedule[day]?.available ?? false}
                                                                                onChange={(e) => handleAvailabilityChange(day, e.target.checked)}
                                                                                color="primary"
                                                                            />
                                                                        }
                                                                        label="Disponible"
                                                        sx={{
                                                            '& .MuiFormControlLabel-label': {
                                                                color: 'text.primary',
                                                            },
                                                        }}
                                                    />
                                                </Box>

                                                                    {schedule[day]?.available && (
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    gap: 2,
                                                }}>
                                                    <TextField
                                                        label="Inicio"
                                                        type="time"
                                                        value={schedule[day]?.start || ''}
                                                        onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                                                        disabled={!schedule[day]?.available}
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        inputProps={{ step: 300, sx: { color: 'text.primary' } }}
                                                    />
                                                    <TextField
                                                        label="Fin"
                                                        type="time"
                                                        value={schedule[day]?.end || ''}
                                                        onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                                                        disabled={!schedule[day]?.available}
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                        inputProps={{ step: 300, sx: { color: 'text.primary' } }}
                                                    />
                                                </Box>
                                                                    )}
                                                                </Stack>
                                                            </Paper>
                                                        </Grid>
                                                    ))}
                                                </Grid>

                            {/* Botón Guardar */}
                            <Box sx={{ 
                                mt: 4,
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}>
                                                    <Button
                                                        variant="contained"
                                    color="primary"
                                                        onClick={handleSaveSchedule}
                                                        disabled={saving}
                                    startIcon={<SaveIcon />}
                                                        sx={{
                                                            minWidth: 200,
                                                            py: 1.5,
                                                            backgroundColor: '#d72a3c',
                                                            '&:hover': {
                                            backgroundColor: '#b0212e'
                                        }
                                    }}
                                >
                                    {saving ? <CircularProgress size={24} color="inherit" /> : 'Guardar cambios'}
                                                    </Button>
                                                </Box>
                                    </motion.div>
                                )}

                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                            )}

                            {showSuccess && (
                                    <Alert severity="success" sx={{ mt: 2 }}>
                                        Horario guardado correctamente
                                    </Alert>
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

                {/* Snackbar */}
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

export default AdminSchedules; 