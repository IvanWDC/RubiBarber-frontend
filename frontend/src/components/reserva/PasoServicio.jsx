import { useState, useEffect } from 'react';
import { 
    Paper, 
    Typography, 
    Grid, 
    Card, 
    CardContent, 
    CardActionArea, 
    Box,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import { useReserva } from '../../context/ReservaContext';
import { reservaService } from '../../api/reservaService';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EuroIcon from '@mui/icons-material/Euro';

const PasoServicio = () => {
    const { 
        servicioSeleccionado, 
        setServicioSeleccionado, 
        siguientePaso,
        peluqueriaSeleccionada
    } = useReserva();
    
    // **Nuevo estado para los servicios y manejo de carga/error**
    const [serviciosPeluqueria, setServiciosPeluqueria] = useState([]);
    const [loadingServicios, setLoadingServicios] = useState(true);
    const [errorServicios, setErrorServicios] = useState(null);

    // **Effect para cargar los servicios activos de la peluquería seleccionada**
    useEffect(() => {
        const cargarServicios = async () => {
            if (peluqueriaSeleccionada?.id) {
                try {
                    setLoadingServicios(true);
                    setErrorServicios(null);
                    const serviciosData = await reservaService.getServiciosActivosByPeluqueria(peluqueriaSeleccionada.id);
                    setServiciosPeluqueria(serviciosData);
                    setLoadingServicios(false);
                } catch (error) {
                    console.error('Error al cargar servicios de la peluquería:', error);
                    setErrorServicios('No se pudieron cargar los servicios de la peluquería.');
                    setLoadingServicios(false);
                }
            } else {
                // Si no hay peluquería seleccionada (aunque no debería pasar si vienes de la página del mapa)
                setServiciosPeluqueria([]);
                setLoadingServicios(false);
            }
        };

        cargarServicios();
    }, [peluqueriaSeleccionada?.id]); // Dependencia: Recargar si cambia la peluquería

    const handleSeleccionServicio = (servicio) => {
        if (servicioSeleccionado?.id === servicio.id) {
            // Si el servicio clickeado ya está seleccionado, lo deseleccionamos
            setServicioSeleccionado(null);
        } else {
            // Si no está seleccionado, seleccionamos este servicio
            setServicioSeleccionado(servicio);
        }
        //setTimeout(siguientePaso, 500); // Pequeño delay para la animación - Quizás quitar para ir directo
        // No avanzamos automáticamente, la restricción está en el botón Siguiente del componente padre
    };

    // **Manejo de estados de carga y error al mostrar la UI**
    if (loadingServicios) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (errorServicios) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {errorServicios}
            </Alert>
        );
    }

    // Si no hay servicios disponibles después de cargar
    if (serviciosPeluqueria.length === 0) {
        return (
            <Alert severity="info" sx={{ mb: 2 }}>
                No hay servicios activos disponibles para esta peluquería en este momento.
            </Alert>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <Typography variant="h6" gutterBottom>
                Selecciona el Servicio
            </Typography>
            
            {/* **Renderizar los servicios desde el estado local** */}
            <Grid container spacing={3}>
                {serviciosPeluqueria.map((servicio) => (
                    <Grid item xs={12} sm={6} md={4} key={servicio.id}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card 
                                className="reserva-servicio-card"
                                sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: servicioSeleccionado?.id === servicio.id 
                                        ? '2px solid #d72a3c' 
                                        : '1px solid rgba(0, 0, 0, 0.12)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <CardActionArea 
                                    onClick={() => handleSeleccionServicio(servicio)}
                                    sx={{ flexGrow: 1 }}
                                >
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {servicio.nombre}
                                        </Typography>
                                        
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            sx={{ mb: 2 }}
                                        >
                                            {servicio.descripcion}
                                        </Typography>

                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mt: 'auto'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccessTimeIcon fontSize="small" color="action" />
                                                <Typography variant="body2"
                                                    sx={{ color: '#333' }}
                                                >
                                                    {servicio.duracion} min
                                                </Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography 
                                                    variant="h6" 
                                                    sx={{ fontWeight: 'bold', color: '#d72a3c' }}
                                                >
                                                    {servicio.precio}
                                                </Typography>
                                                <EuroIcon fontSize="small" sx={{ color: '#d72a3c' }} />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>
        </motion.div>
    );
};

export default PasoServicio; 