import { useState, useEffect } from 'react'
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { resetPassword } from '../api/auth'
import '../styles/ResetPasswordPage.css'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido o expirado.')
      setTimeout(() => navigate('/forgot-password'), 3000)
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validaciones
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      await resetPassword(token, newPassword)
      setSuccess('Contraseña actualizada correctamente. Serás redirigido al inicio de sesión.')
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña. El token puede haber expirado.')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  if (!token) {
    return (
      <div className="reset-password-container">
        <Paper elevation={6} className="reset-password-box">
          <Alert severity="error">
            Token de recuperación no válido o expirado. Redirigiendo...
          </Alert>
        </Paper>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="reset-password-container"
    >
      <Paper elevation={6} className="reset-password-box">
        <Box className="reset-password-header">
          <Typography variant="h4" className="reset-password-title">
            Restablecer Contraseña
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
            Ingresa tu nueva contraseña
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} className="reset-password-form">
          <TextField
            fullWidth
            label="Nueva contraseña"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirmar contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            className="reset-password-button"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </Box>

        <Box className="reset-password-back-link">
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

export default ResetPasswordPage 