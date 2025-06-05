import { useState } from 'react'
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import '../styles/ForgotPasswordPage.css'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { forgotPasswordRequest, resetPassword } from '../api/auth'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // TODO: Implementar la llamada a la API
      const response = await forgotPasswordRequest(email)
      // Simulamos una respuesta exitosa por ahora
      // await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(response.data)
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la solicitud. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="forgot-password-container"
    >
      <Paper elevation={6} className="forgot-password-box">
        <Box className="forgot-password-header">
          <Typography variant="h4" className="forgot-password-title">
            Recuperar Contraseña
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
            Ingresa tu correo electrónico y te enviaremos las instrucciones para recuperar tu contraseña.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} className="forgot-password-form">
          <TextField
            fullWidth
            label="Correo electrónico"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            className="forgot-password-button"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </Button>
        </Box>

        <Box className="forgot-password-back-link">
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            <span
              className="back-to-login-link"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            >
              Volver al inicio de sesión
            </span>
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  )
}

export default ForgotPasswordPage 