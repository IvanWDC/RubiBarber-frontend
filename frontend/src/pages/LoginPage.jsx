import { useState } from 'react'
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
} from '@mui/material'
import { loginUser } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import '../styles/LoginPage.css'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await loginUser(email, password)

      // Verificar la estructura EXACTA de la respuesta del login
      if (!data || typeof data !== 'object' || data.token === undefined || typeof data.token !== 'string') {
        console.error('Estructura inesperada en la respuesta del login:', data)
        setError('Error al procesar la respuesta del servidor.')
        localStorage.removeItem('token') // Limpiar cualquier token inválido
        setLoading(false)
        return // Salir de la función si la respuesta no es válida
      }

      const tokenPlano = data.token

      login({
        token: String(tokenPlano),
        rol: data.rol,
        idUsuario: data.idUsuario,
        email: data.email,
        nombre: data.nombre,
        peluqueria: data.peluqueria
      })
      
      // Depuración: mostrar la estructura completa de data
      console.log('Datos recibidos del login:', data)

      // Extraer el rol desde el token JWT
      const decoded = jwtDecode(tokenPlano)
      const rol = (decoded.rol || 'UNKNOWN').toUpperCase().trim()

      // Redirigir según el rol
      if (rol === 'ADMIN') {
        navigate('/admin/dashboard')
      } else if (rol === 'CLIENTE') {
        navigate('/cliente/dashboard')
      } else if (rol === 'PELUQUERO') {
        navigate('/peluquero/agenda')
      } else {
        console.error('Rol no reconocido en el token. Token decodificado:', decoded)
        setError('Rol de usuario no válido o no especificado en el token')
      }
    } catch (err) {
      console.error('Error durante el login:', err)
      setError(err.response?.data?.message || 'Error al iniciar sesión. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Paper elevation={6} className="login-box">
        <Box className="login-header">
          <div className="login-logo-circle">
            <div className="login-logo-inner">
              <img src="/logo.png" alt="Rubí Barber" className="login-logo" />
            </div>
          </div>
          <Typography variant="h4" className="login-title">
            Rubí Barber
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleLogin} className="login-form">
          <TextField
            fullWidth
            label="Correo electrónico"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Box>

        <Box className="login-register-link">
          <Typography variant="body2" align="center" className="login-register-link">
            ¿No tienes cuenta?{' '}
            <span className="register-link" onClick={() => navigate('/register')}>
              Regístrate
            </span>
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            <span
              className="register-link"
              onClick={() => navigate('/forgot-password')}
              style={{ cursor: 'pointer' }}
            >
              ¿Has olvidado tu contraseña?
            </span>
          </Typography>
        </Box>
      </Paper>
    </div>
  )
}

export default LoginPage
