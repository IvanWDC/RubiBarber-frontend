import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Lista de rutas públicas que no requieren token
const PUBLIC_ROUTES = [
  '/auth/reset-password',
  '/auth/solicitar-reset-password'
];

API.interceptors.request.use((config) => {
  // Verificar si la ruta actual es pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => config.url.includes(route));
  
  if (isPublicRoute) {
    console.log('Axios Interceptor - Ruta pública detectada, omitiendo token');
    return config;
  }

  const token = localStorage.getItem('token');
  console.log('Axios Interceptor - Verificando token:', token ? 'Token presente' : 'No hay token');
  
  // Validación estricta del token
  if (typeof token !== 'string') {
    console.error('Axios Interceptor - Token inválido. Tipo:', typeof token);
    localStorage.removeItem('token');
    return config;
  }

  // Validar formato básico JWT
  if (!token.trim() || !token.includes('.')) {
    console.error('Axios Interceptor - Token malformado o vacío');
    localStorage.removeItem('token');
    return config;
  }

  try {
    // Validación básica de estructura JWT
    const [header, payload] = token.split('.');
    if (!header || !payload) {
      throw new Error('Token malformado');
    }

    console.log('Axios Interceptor - Token válido, añadiendo a la petición');
    config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.error('Axios Interceptor - Error al procesar el token:', error.message);
    localStorage.removeItem('token');
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Axios Interceptor - Error 401: Token posiblemente inválido o expirado');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default API;
