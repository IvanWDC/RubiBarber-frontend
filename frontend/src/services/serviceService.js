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

export const serviceService = {
    // Obtener todos los servicios de la peluquería del admin
    getAllServices: async () => {
        try {
            const response = await api.get('/servicios');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Crear un nuevo servicio
    createService: async (serviceData) => {
        try {
            const response = await api.post('/servicios', serviceData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Actualizar un servicio existente
    updateService: async (id, serviceData) => {
        try {
            const response = await api.put(`/servicios/${id}`, serviceData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Cambiar el estado de un servicio (activar/desactivar)
    toggleServiceStatus: async (id, active) => {
        try {
            const response = await api.patch(`/servicios/${id}/estado`, { activo: active });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Eliminar un servicio
    deleteService: async (id) => {
        try {
            const response = await api.delete(`/servicios/${id}`);
            return response.data; // O podrías retornar response.status si el backend no devuelve cuerpo en DELETE exitoso
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 