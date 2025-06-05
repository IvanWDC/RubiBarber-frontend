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

export const peluqueriaService = {
    // Obtener la información de la peluquería del admin logueado
    getMiPeluqueria: async () => {
        try {
            const response = await api.get('/peluquerias/mia');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 