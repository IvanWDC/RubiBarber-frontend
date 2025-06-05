import { useState, useEffect } from 'react';
import { 
    Typography, 
    Grid, 
    Card, 
    CardContent, 
    CardActionArea, 
    CardMedia, 
    Box, 
    Chip,
    CircularProgress,
    Alert,
    Avatar,
    Rating
} from '@mui/material';
import { motion } from 'framer-motion';
import { useReserva } from '../../context/ReservaContext';
import { reservaService } from '../../api/reservaService';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';

const PasoPeluquero = () => {
    const { 
        peluqueriaSeleccionada, 
        peluqueroSeleccionado, 
        setPeluqueroSeleccionado, 
        siguientePaso,
        servicioSeleccionado 
    } = useReserva();
    
    const [peluqueros, setPeluqueros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarPeluqueros = async () => {
            if (!peluqueriaSeleccionada) {
                setError('No se ha seleccionado una peluquería');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError(null);
                const data = await reservaService.getPeluquerosByPeluqueria(peluqueriaSeleccionada.id);
                console.log('Peluqueros recibidos del backend (sin filtrar):', data); // Modificado para depurar

                // Eliminar el filtro basado en servicio
                // const peluquerosFiltrados = servicioSeleccionado 
                //     ? data.filter(p => p.servicios.some(s => s.id === servicioSeleccionado.id))
                //     : data;
                
                // Mostrar todos los peluqueros recibidos del backend (que ya vienen filtrados por activo: true desde el servicio)
                setPeluqueros(data.filter(p => p.activo)); // Asegurarse de que solo se muestren los activos si el servicio no lo hace

            } catch (error) {
                setError(error.message);
                console.error('Error al cargar peluqueros:', error);
            } finally {
                setLoading(false);
            }
        };
        cargarPeluqueros();
    }, [peluqueriaSeleccionada]);

    const handleSeleccionPeluquero = (peluquero) => {
        setPeluqueroSeleccionado(peluquero);
        // Eliminar la llamada automática a siguientePaso
        // setTimeout(siguientePaso, 500);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    if (peluqueros.length === 0) {
        return (
            <Alert severity="info" sx={{ mb: 2 }}>
                No hay peluqueros disponibles para este servicio en la peluquería seleccionada.
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
                Selecciona un Peluquero
            </Typography>

            <Grid container spacing={3}>
                {peluqueros.map((peluquero) => (
                    <Grid item xs={12} sm={6} md={4} key={peluquero.id}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Card 
                                sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: peluqueroSeleccionado?.id === peluquero.id 
                                        ? '2px solid #d72a3c' 
                                        : '1px solid rgba(0, 0, 0, 0.12)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <CardActionArea 
                                    onClick={() => handleSeleccionPeluquero(peluquero)}
                                    sx={{ flexGrow: 1 }}
                                >
                                    <CardContent>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            mb: 2,
                                            gap: 2
                                        }}>
                                            <Avatar
                                                src={peluquero.foto}
                                                alt={peluquero.nombre}
                                                sx={{ width: 64, height: 64 }}
                                            />
                                            <Box>
                                                <Typography variant="h6" sx={{ color: 'text.primary' }}>
                                                    {peluquero.nombre}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <WorkIcon fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {peluquero.especialidad}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {peluquero.valoracionMedia && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Rating
                                                    value={peluquero.valoracionMedia}
                                                    precision={0.5}
                                                    readOnly
                                                    size="small"
                                                    icon={<StarIcon fontSize="inherit" />}
                                                />
                                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                    ({peluquero.numValoraciones || 0})
                                                </Typography>
                                            </Box>
                                        )}
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

export default PasoPeluquero; 