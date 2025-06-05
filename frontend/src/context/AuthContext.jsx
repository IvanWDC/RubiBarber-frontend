import { createContext, useContext, useState, useMemo } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [rol, setRol] = useState(localStorage.getItem('rol') || null)
  const [userData, setUserData] = useState(() => {
    const storedData = localStorage.getItem('userData')
    return storedData ? JSON.parse(storedData) : null
  })
  const [loading, setLoading] = useState(false)

  const login = (authData) => {
    console.log('AuthContext - Iniciando login con authData:', { ...authData, token: '[REDACTED]' });

    // Validar que authData y token existan
    if (!authData || !authData.token) {
      console.error('AuthContext - Error: authData o token no proporcionados');
      return;
    }

    const { token, rol, idUsuario, email, nombre, peluqueria } = authData;

    // Validación estricta del token
    if (typeof token !== 'string') {
      console.error('AuthContext - Error: el token no es un string válido. Tipo:', typeof token, 'Valor:', token);
      localStorage.removeItem('token'); // Limpiar token inválido si existe
      return;
    }

    // Validar que el token no esté vacío y tenga formato JWT básico
    if (!token.trim() || !token.includes('.')) {
      console.error('AuthContext - Error: el token no tiene formato JWT válido');
      localStorage.removeItem('token');
      return;
    }

    try {
      // Intentar decodificar el token para validar formato básico
      const [header, payload] = token.split('.');
      if (!header || !payload) {
        throw new Error('Token malformado');
      }
      
      console.log('AuthContext - Token validado correctamente');
      
      setToken(token);
      setRol(rol);
      setUserData({ idUsuario, email, nombre, peluqueria });
      
      localStorage.setItem('token', token);
      localStorage.setItem('rol', rol);
      localStorage.setItem('userData', JSON.stringify({ idUsuario, email, nombre, peluqueria }));
      
      console.log('AuthContext - Login completado exitosamente');
    } catch (error) {
      console.error('AuthContext - Error al procesar el token:', error.message);
      localStorage.removeItem('token');
    }
  }

  const updateUserData = (newData) => {
    // Simple comparison to avoid unnecessary updates
    const hasRelevantChanges = (
        userData?.nombre !== newData?.nombre ||
        userData?.email !== newData?.email ||
        userData?.rol !== newData?.rol ||
        userData?.activo !== newData?.activo ||
        userData?.imagenPerfilUrl !== newData?.imagenPerfilUrl ||
        userData?.peluqueria?.id !== newData?.peluqueria?.id // Compare peluqueria by ID
    );

    if (hasRelevantChanges) {
      console.log('AuthContext - Actualizando userData debido a cambios relevantes');
      setUserData(newData);
      localStorage.setItem('userData', JSON.stringify(newData));
    } else {
      console.log('AuthContext - userData sin cambios relevantes, evitando actualización de estado');
    }
  };

  const logout = () => {
    setToken(null)
    setRol(null)
    setUserData(null)
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    localStorage.removeItem('userData')
  }

  const isAuthenticated = !!token

  const value = useMemo(
    () => ({
      isAuthenticated,
      userData,
      loading,
      login,
      logout,
      setUserData,
      token,
      rol,
      updateUserData,
    }),
    [isAuthenticated, userData, loading, login, logout, setUserData, token, rol, updateUserData]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
