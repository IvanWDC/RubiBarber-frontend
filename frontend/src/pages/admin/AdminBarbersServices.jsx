import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Divider, TextField, InputAdornment, List, ListItem, ListItemIcon, ListItemText, Grid, Snackbar, Alert, Avatar, Chip, CircularProgress, Modal, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Work as WorkIcon,
    Schedule as ScheduleIcon,
    EventNote as EventNoteIcon,
    Receipt as ReceiptIcon,
    Star as StarIcon,
    Search as SearchIcon,
    AccountCircle as AccountCircleIcon,
    Notifications as NotificationsIcon,
    Spa as SpaIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Store as StoreIcon,
    Close as CloseIcon,
    PhotoCamera as PhotoCameraIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Logout as LogoutIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { barberService } from '../../services/barberService';
import { serviceService } from '../../services/serviceService';
import BarberForm from '../../components/admin/BarberForm';
import ServiceForm from '../../components/admin/ServiceForm';

import '../../styles/AdminDashboard.css';
import '../../styles/AdminBarbersServices.css';

const AdminBarbersServices = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userData, updateUserData } = useAuth();
    console.log('userData en AdminBarbersServices:', userData);
    const [tabValue, setTabValue] = useState(0);
    const [barbers, setBarbers] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [peluqueria, setPeluqueria] = useState(null);
    const [peluqueriaError, setPeluqueriaError] = useState(null);
    
    // Estados para los formularios
    const [serviceFormOpen, setServiceFormOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    
    // Estado para notificaciones
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [adminProfile, setAdminProfile] = useState({
        nombreCompleto: '',
        correoElectronico: '',
        password: '',
        imagenPerfilUrl: null,
        nuevaImagenPerfil: null,
        idUsuario: null,
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

    // Añadir estado para el modal de confirmación de servicio
    const [deleteServiceModalOpen, setDeleteServiceModalOpen] = useState(false);
    const [serviceToDeleteId, setServiceToDeleteId] = useState(null);

    // Añadir estado para el modal de confirmación de peluquero
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [barberToDelete, setBarberToDelete] = useState(null);

    // Nuevo estado para el modal de creación de peluquero
    const [barberFormOpen, setBarberFormOpen] = useState(false);
    const [selectedBarber, setSelectedBarber] = useState(null);

    const BASE_BACKEND_URL = 'http://localhost:8080';

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'servicios') {
            setTabValue(1);
        } else {
            setTabValue(0);
        }
    }, [location.search]);

    useEffect(() => {
        fetchData();
        if (userData?.peluqueria) {
            setPeluqueria(userData.peluqueria);
        }
    }, [userData]);

    useEffect(() => {
        let isMounted = true;
        const fetchServices = async () => {
            try {
                const data = await serviceService.getAllServices();
                console.log('Respuesta cruda del backend:', data);
                if (Array.isArray(data)) {
                    if (isMounted) setServices(data);
                } else if (data && Array.isArray(data.servicios)) {
                    if (isMounted) setServices(data.servicios);
                } else {
                    console.error('La respuesta no es un array:', data);
                    if (isMounted) setServices([]);
                }
            } catch (error) {
                console.error('Error al cargar servicios:', error);
                if (isMounted) setServices([]);
            }
        };
        fetchServices();
        return () => { isMounted = false; };
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const barbersData = await barberService.getAllBarbers();
            
            // Mapear los datos de peluqueros asegurando que tengan el ID correcto y leyendo los campos del nivel superior del DTO
            const barbersWithId = Array.isArray(barbersData) ? barbersData.map(peluquero => {
                const mappedBarber = {
                    id: peluquero.id || peluquero.peluqueroId,
                    nombre: peluquero.nombre,
                    email: peluquero.email,
                    especialidad: peluquero.especialidad,
                    activo: peluquero.activo,
                    rol: peluquero.rol,
                };
                console.log('Peluquero mapeado para la tabla:', mappedBarber);
                return mappedBarber;
            }) : [];
            
            console.log('Lista completa de peluqueros para la tabla:', barbersWithId);
            setBarbers(barbersWithId);
            setError(null);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleServiceSubmit = async (formData) => {
        try {
            if (selectedService) {
                await serviceService.updateService(selectedService.id, formData);
                setSnackbar({
                    open: true,
                    message: 'Servicio actualizado correctamente',
                    severity: 'success'
                });
            } else {
                await serviceService.createService(formData);
                setSnackbar({
                    open: true,
                    message: 'Servicio creado correctamente',
                    severity: 'success'
                });
            }
            
            // Obtener la lista actualizada de servicios
            const updatedServices = await serviceService.getAllServices();
            console.log('Servicios actualizados después de crear/actualizar:', updatedServices); // Log para debugging
            
            if (Array.isArray(updatedServices)) {
                setServices(updatedServices);
            } else {
                console.error('Los datos recibidos no son un array:', updatedServices);
                setServices([]);
            }
            
            setServiceFormOpen(false);
            setSelectedService(null);
        } catch (err) {
            console.error('Error al guardar el servicio:', err);
            setSnackbar({
                open: true,
                message: 'Error al guardar el servicio',
                severity: 'error'
            });
        }
    };

    const filteredBarbers = barbers.filter(barber =>
        barber.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        barber.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredServices = services.filter(service =>
        service.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sidebarItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Peluqueros', icon: <WorkIcon />, path: '/admin/barbers-services', active: tabValue === 0 },
        { text: 'Servicios', icon: <SpaIcon />, path: '/admin/barbers-services', active: tabValue === 1 },
        { text: 'Horarios', icon: <ScheduleIcon />, path: '/admin/schedules' },
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
            idUsuario: userData?.id
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

    // Eliminar handleBarberSubmit y añadir handleDeleteBarber
    const handleDeleteBarber = async () => {
        console.log('handleDeleteBarber - barberToDelete:', barberToDelete); // Log temporal
        
        if (!barberToDelete || !barberToDelete.id) {
            console.error('Error: No se puede eliminar el peluquero - ID no válido', barberToDelete);
            setSnackbar({
                open: true,
                message: 'Error: No se puede eliminar el peluquero - ID no válido',
                severity: 'error'
            });
            return;
        }

        try {
            console.log('Intentando eliminar peluquero con ID:', barberToDelete.id); // Log temporal
            await barberService.deleteBarber(barberToDelete.id);
            setSnackbar({
                open: true,
                message: 'Peluquero eliminado correctamente',
                severity: 'success'
            });
            setDeleteModalOpen(false);
            setBarberToDelete(null);
            fetchData(); // Recargar la lista después de eliminar
        } catch (err) {
            console.error('Error al eliminar peluquero:', err);
            setSnackbar({
                open: true,
                message: err.message || 'Error al eliminar el peluquero',
                severity: 'error'
            });
        }
    };

    // Definir handleBarberSubmit
    const handleBarberSubmit = async (formData) => {
        try {
            // La contraseña no se incluye aquí, el backend la gestionará y enviará email
            await barberService.createBarber(formData);
            setSnackbar({
                open: true,
                message: 'Peluquero creado correctamente',
                severity: 'success'
            });
            setBarberFormOpen(false); // Cerrar el modal después de crear
            fetchData(); // Recargar la lista de peluqueros
        } catch (err) {
            console.error('Error al crear peluquero:', err);
            setSnackbar({
                open: true,
                message: 'Error al crear el peluquero',
                severity: 'error'
            });
        }
    };

    // Nueva función para eliminar servicio - Ahora abre el modal
    const handleDeleteService = (serviceId) => {
        setServiceToDeleteId(serviceId);
        setDeleteServiceModalOpen(true);
    };

    // Nueva función para confirmar la eliminación del servicio (llamada desde el modal)
    const handleConfirmDeleteService = async () => {
        // Cerrar el modal
        setDeleteServiceModalOpen(false);

        if (serviceToDeleteId === null) {
            console.error('Error: No se puede eliminar el servicio - ID no válido');
            setSnackbar({
                open: true,
                message: 'Error: No se puede eliminar el servicio - ID no válido',
                severity: 'error'
            });
            return;
        }

        try {
            // Llamar al serviceService para eliminar el servicio
            await serviceService.deleteService(serviceToDeleteId);

            // Actualizar el estado local: remover el servicio eliminado de la lista
            setServices(services.filter(service => service.id !== serviceToDeleteId));

            // Mostrar mensaje de éxito en el Snackbar
            setSnackbar({
                open: true,
                message: 'Servicio eliminado correctamente',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error al eliminar el servicio:', err);
            // Mostrar mensaje de error en el Snackbar
            setSnackbar({
                open: true,
                message: 'Error al eliminar el servicio',
                severity: 'error'
            });
        } finally {
            // Limpiar el ID del servicio a eliminar
            setServiceToDeleteId(null);
        }
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
                            {sidebarItems.map((item, index) => (
                                <ListItem
                                    button
                                    key={item.text}
                                    component={Link}
                                    to={item.path}
                                    onClick={() => setTabValue(index === 1 ? 0 : (index === 2 ? 1 : tabValue))}
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
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Gestión de {tabValue === 0 ? 'Peluqueros' : 'Servicios'}
                    </Typography>
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

                {/* Content Area */}
                <Box className="admin-dashboard-content-area admin-barbers-services-content-area">
                    {/* Barra de búsqueda */}
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                style: { borderRadius: '20px', backgroundColor: '#f0f0f0' }
                            }}
                            sx={{ '& fieldset': { border: 'none' } }}
                        />
                    </Box>

                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="gestión tabs" sx={{ mb: 3 }}>
                        <Tab label="Peluqueros" />
                        <Tab label="Servicios" />
                    </Tabs>

                    {/* Botón Nuevo */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                if (tabValue === 0) {
                                    // Abrir modal de creación de peluquero
                                    setSelectedBarber(null); // Asegurarse de que selectedBarber es null para modo creación
                                    setBarberFormOpen(true);
                                } else {
                                    setSelectedService(null);
                                    setServiceFormOpen(true);
                                }
                            }}
                            sx={{ bgcolor: '#d72a3c', '&:hover': { bgcolor: '#b0212e' } }}
                        >
                            Nuevo {tabValue === 0 ? 'Peluquero' : 'Servicio'}
                        </Button>
                    </Box>

                    {/* Contenido de la Tabla */}
                    {tabValue === 0 && (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Especialidad</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredBarbers.map((barber) => (
                                        <TableRow key={barber.id}>
                                            <TableCell>{barber.nombre}</TableCell>
                                            <TableCell>{barber.especialidad}</TableCell>
                                            <TableCell>{barber.email}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    aria-label="eliminar"
                                                    onClick={() => {
                                                        console.log('Peluquero seleccionado para eliminar (objeto completo):', barber); // Log temporal
                                                        console.log('ID del peluquero seleccionado:', barber.id); // Log temporal específico del ID
                                                        
                                                        if (!barber.id) {
                                                            console.error('Error: Peluquero sin ID válido. Objeto completo:', barber);
                                                            setSnackbar({
                                                                open: true,
                                                                message: 'Error: No se puede eliminar el peluquero - ID no válido',
                                                                severity: 'error'
                                                            });
                                                            return;
                                                        }
                                                        
                                                        setBarberToDelete(barber);
                                                        setDeleteModalOpen(true);
                                                    }}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {tabValue === 1 && (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Precio</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Duración</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredServices.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell>{service.nombre}</TableCell>
                                            <TableCell>{service.precio.toFixed(2)} €</TableCell>
                                            <TableCell>{service.duracion} min</TableCell>
                                            <TableCell>{service.descripcion}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    aria-label="editar"
                                                    onClick={() => {
                                                        setSelectedService(service);
                                                        setServiceFormOpen(true);
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton 
                                                    aria-label="eliminar servicio"
                                                    color="error"
                                                    onClick={() => handleDeleteService(service.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Box>

            {/* Formularios */}
            <BarberForm
                open={barberFormOpen}
                handleClose={() => setBarberFormOpen(false)}
                barber={selectedBarber}
                onSubmit={handleBarberSubmit}
            />

            <ServiceForm
                open={serviceFormOpen}
                handleClose={() => {
                    setServiceFormOpen(false);
                    setSelectedService(null);
                }}
                service={selectedService}
                onSubmit={handleServiceSubmit}
            />

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

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

            {/* Modal de confirmación de eliminación de SERVICIO */}
            <Modal
                open={deleteServiceModalOpen}
                onClose={() => {
                    setDeleteServiceModalOpen(false);
                    setServiceToDeleteId(null);
                }}
                aria-labelledby="delete-service-modal-title"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'white',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}>
                    <Typography id="delete-service-modal-title" variant="h6" component="h2" gutterBottom sx={{ color: "black" }}>
                        Confirmar eliminación de servicio
                    </Typography>
                    <Typography sx={{ mb: 3, color: "black" }}>
                        ¿Estás seguro de que quieres eliminar este servicio?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            onClick={() => {
                                setDeleteServiceModalOpen(false);
                                setServiceToDeleteId(null);
                            }}
                            variant="outlined"
                            sx={{ 
                                borderColor: "#d32f2f",
                                color: "#d32f2f",
                                '&:hover': { 
                                    borderColor: "#b71c1c",
                                    backgroundColor: "rgba(211, 47, 47, 0.04)"
                                }, 
                                mr: 1 
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirmDeleteService}
                            variant="contained"
                            color="error"
                        >
                            Eliminar
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Modal de confirmación de eliminación de PELUQUERO */}
            <Modal
                open={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setBarberToDelete(null);
                }}
                aria-labelledby="delete-modal-title"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'white',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}>
                    <Typography id="delete-modal-title" variant="h6" component="h2" gutterBottom sx={{ color: "black" }}>
                        Confirmar eliminación
                    </Typography>
                    <Typography sx={{ mb: 3, color: "black" }}>
                        ¿Estás seguro de que quieres eliminar al peluquero {barberToDelete?.nombre}?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setBarberToDelete(null);
                            }}
                            variant="outlined"
                            sx={{ 
                                borderColor: "#d32f2f",
                                color: "#d32f2f",
                                '&:hover': { 
                                    borderColor: "#b71c1c",
                                    backgroundColor: "rgba(211, 47, 47, 0.04)"
                                }, 
                                mr: 1 
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDeleteBarber}
                            variant="contained"
                            color="error"
                        >
                            Eliminar
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default AdminBarbersServices; 