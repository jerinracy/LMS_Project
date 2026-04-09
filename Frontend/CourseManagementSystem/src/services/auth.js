import api from './api'

export const registerUser = async (payload) => {
  const response = await api.post('/users/register/', payload)
  return response.data
}

export const loginUser = async (payload) => {
  const response = await api.post('/users/login/', payload)
  return response.data
}

export const logoutUser = async (refresh) => {
  const response = await api.post('/users/logout/', { refresh })
  return response.data
}
