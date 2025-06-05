import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box
} from '@mui/material';

const ServiceForm = ({ open, handleClose, service = null, onSubmit }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        duracion: '',
        descripcion: ''
    });

    useEffect(() => {
        if (service) {
            setFormData({
                nombre: service.nombre || '',
                precio: service.precio || '',
                duracion: service.duracion || '',
                descripcion: service.descripcion || ''
            });
        } else {
            setFormData({
                nombre: '',
                precio: '',
                duracion: '',
                descripcion: ''
            });
        }
    }, [service]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convertir precio y duración a números
        const submitData = {
            ...formData,
            precio: parseFloat(formData.precio),
            duracion: parseInt(formData.duracion)
        };
        onSubmit(submitData);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: 'black' }}>
                {service ? 'Editar Servicio' : 'Nuevo Servicio'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            name="nombre"
                            label="Nombre del Servicio"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            name="precio"
                            label="Precio (€)"
                            type="number"
                            value={formData.precio}
                            onChange={handleChange}
                            required
                            fullWidth
                            inputProps={{ step: "0.01", min: "0" }}
                        />
                        <TextField
                            name="duracion"
                            label="Duración (minutos)"
                            type="number"
                            value={formData.duracion}
                            onChange={handleChange}
                            required
                            fullWidth
                            inputProps={{ min: "1" }}
                        />
                        <TextField
                            name="descripcion"
                            label="Descripción"
                            value={formData.descripcion}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} sx={{ color: 'red' }}>Cancelar</Button>
                    <Button type="submit" variant="contained" sx={{ bgcolor: 'red', '&:hover': { bgcolor: 'darkred' } }}>
                        {service ? 'Guardar Cambios' : 'Crear Servicio'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ServiceForm; 