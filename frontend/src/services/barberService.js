import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Crear una instancia de axios con la configuración base
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const barberService = {
    // Obtener todos los peluqueros de la peluquería del admin
    getAllBarbers: async () => {
        try {
            const response = await api.get('/peluquero');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Crear un nuevo peluquero
    createBarber: async (barberData) => {
        try {
            const response = await api.post('/peluquero/crear', barberData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Actualizar un peluquero existente
    updateBarber: async (id, barberData) => {
        try {
            const response = await api.put(`/peluquero/${id}`, barberData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Cambiar el estado de un peluquero (activar/desactivar)
    toggleBarberStatus: async (usuarioId) => {
        try {
            const response = await api.patch(`/usuario/${usuarioId}/toggle-estado`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Eliminar un peluquero y su usuario asociado
    deleteBarber: async (id) => {
        try {
            const response = await api.delete(`/peluquero/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Verificar si un correo electrónico ya existe
    checkEmailExists: async (email) => {
        try {
            const response = await api.get(`/usuarios/verificar-email/${email}`);
            return response.data.exists;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 