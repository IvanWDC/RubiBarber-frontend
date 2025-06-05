import API from './client'

export const loginUser = async (email, password) => {
  const response = await API.post('/auth/login', {
    email,
    password,
  })
  return response.data
}

export const forgotPasswordRequest = async (email) => {
  const response = await API.post('/auth/forgot-password', { email })
  return response.data
}

export const resetPassword = async (token, newPassword) => {
  const response = await API.post(`/auth/reset-password?token=${token}`, { password: newPassword })
  return response.data
}
