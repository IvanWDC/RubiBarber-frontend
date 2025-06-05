import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Stack,
    Alert,
    CircularProgress
} from '@mui/material';
import { barberService } from '../../services/barberService';

const BarberForm = ({ open, handleClose, barber = null, onSubmit }) => {
    const [formData, setFormData] = useState({
        usuario: {
            nombre: barber?.usuario?.nombre || '',
            email: barber?.usuario?.email || '',
        },
        especialidad: barber?.especialidad || '',
        activo: barber?.activo ?? true
    });

    const [errors, setErrors] = useState({
        nombre: '',
        email: '',
        especialidad: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        if (barber) {
            setFormData({
                usuario: {
                    nombre: barber.usuario?.nombre || '',
                    email: barber.usuario?.email || '',
                },
                especialidad: barber.especialidad || '',
                activo: barber.activo ?? true
            });
        } else {
            setFormData({
                usuario: {
                    nombre: '',
                    email: '',
                },
                especialidad: '',
                activo: true
            });
        }
        // Limpiar errores cuando se abre el formulario
        setErrors({
            nombre: '',
            email: '',
            especialidad: ''
        });
        setEmailError('');
    }, [barber, open]);

    const validateForm = () => {
        const newErrors = {
            nombre: '',
            email: '',
            especialidad: ''
        };
        let isValid = true;

        if (!formData.usuario.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
            isValid = false;
        }

        if (!formData.usuario.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.usuario.email)) {
            newErrors.email = 'El correo electrónico no es válido';
            isValid = false;
        }

        if (!formData.especialidad.trim()) {
            newErrors.especialidad = 'La especialidad es requerida';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setFormData(prev => ({
                ...prev,
                usuario: {
                    ...prev.usuario,
                    [name]: value
                }
            }));
            // Limpiar el error de email cuando el usuario empieza a escribir
            setEmailError('');
        } else if (name === 'nombre') {
            setFormData(prev => ({
                ...prev,
                usuario: {
                    ...prev.usuario,
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            // Verificar si el correo ya existe (solo si es un nuevo peluquero)
            if (!barber) {
                try {
                    const emailExists = await barberService.checkEmailExists(formData.usuario.email);
                    if (emailExists) {
                        setEmailError('Este correo electrónico ya está registrado');
                        setIsLoading(false);
                        return;
                    }
                } catch (error) {
                    console.error('Error al verificar el email:', error);
                    setEmailError('Error al verificar el correo electrónico. Por favor, intente nuevamente.');
                    setIsLoading(false);
                    return;
                }
            }
            
            await onSubmit(formData);
            handleClose();
        } catch (error) {
            console.error('Error al guardar el peluquero:', error);
            let errorMessage = 'Error al guardar el peluquero. ';
            
            if (error.response?.data?.message) {
                errorMessage += error.response.data.message;
            } else if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += 'Por favor, intente nuevamente.';
            }
            
            setEmailError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: '#000', fontWeight: 'bold' }}>
                {barber ? 'Editar Peluquero' : 'Nuevo Peluquero'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {emailError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {emailError}
                            </Alert>
                        )}
                        <TextField
                            name="nombre"
                            label="Nombre"
                            value={formData.usuario.nombre}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            error={!!errors.nombre}
                            helperText={errors.nombre}
                        />
                        <TextField
                            name="especialidad"
                            label="Especialidad"
                            value={formData.especialidad}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            error={!!errors.especialidad}
                            helperText={errors.especialidad}
                        />
                        <TextField
                            name="email"
                            label="Email"
                            type="email"
                            value={formData.usuario.email}
                            onChange={handleInputChange}
                            required
                            fullWidth
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} sx={{ color: '#d32f2f' }}>
                        CANCELAR
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        sx={{ 
                            backgroundColor: '#d32f2f', 
                            '&:hover': { backgroundColor: '#9a0007' } 
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            barber ? 'GUARDAR CAMBIOS' : 'CREAR PELUQUERO'
                        )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default BarberForm; 