import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

let authHandlers = {
  getTokens: () => ({ access: null, refresh: null }),
  onTokensUpdate: () => {},
  onLogout: () => {},
}

export const configureApiAuth = (handlers) => {
  authHandlers = { ...authHandlers, ...handlers }
}

api.interceptors.request.use((config) => {
  const { access } = authHandlers.getTokens()
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthPath = originalRequest?.url?.includes('/users/login/') || originalRequest?.url?.includes('/users/token/refresh/')

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthPath) {
      originalRequest._retry = true
      const { refresh } = authHandlers.getTokens()

      if (!refresh) {
        authHandlers.onLogout()
        return Promise.reject(error)
      }

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/users/token/refresh/`, { refresh })
        const nextAccess = refreshResponse.data.access
        const nextRefresh = refreshResponse.data.refresh || refresh

        authHandlers.onTokensUpdate({ access: nextAccess, refresh: nextRefresh })
        originalRequest.headers.Authorization = `Bearer ${nextAccess}`
        return api(originalRequest)
      } catch (refreshError) {
        authHandlers.onLogout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export const extractResults = (data) => {
  if (Array.isArray(data)) {
    return { results: data, next: null, previous: null, count: data.length }
  }
  return {
    results: data.results || [],
    next: data.next || null,
    previous: data.previous || null,
    count: data.count || 0,
  }
}

export const listCourses = async (page = 1) => {
  const response = await api.get('/courses/', { params: { page } })
  return extractResults(response.data)
}

export const getCourseDetails = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/`)
  return response.data
}

export const createCourse = async (payload) => {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('description', payload.description)

  if (payload.thumbnail) {
    formData.append('thumbnail', payload.thumbnail)
  }

  const response = await api.post('/courses/', formData)
  return response.data
}

export const updateCourse = async (courseId, payload) => {
  const response = await api.patch(`/courses/${courseId}/`, payload)
  return response.data
}

export const deleteCourse = async (courseId) => {
  await api.delete(`/courses/${courseId}/`)
}

export const listLessons = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/lessons/`)
  return extractResults(response.data).results
}

export const createLesson = async (courseId, payload) => {
  const response = await api.post(`/courses/${courseId}/lessons/`, payload)
  return response.data
}

export const getLessonDetails = async (courseId, lessonId) => {
  const response = await api.get(`/courses/${courseId}/lessons/${lessonId}/`)
  return response.data
}

export const updateLesson = async (courseId, lessonId, payload) => {
  const response = await api.patch(`/courses/${courseId}/lessons/${lessonId}/`, payload)
  return response.data
}

export const deleteLesson = async (courseId, lessonId) => {
  await api.delete(`/courses/${courseId}/lessons/${lessonId}/`)
}

export const enrollInCourse = async (courseId) => {
  const response = await api.post('/enrollments/enroll/', { course_id: courseId })
  return response.data
}

export const listMyEnrollments = async () => {
  const response = await api.get('/enrollments/my-courses/')
  return extractResults(response.data)
}

export const markLessonComplete = async (lessonId) => {
  const response = await api.post(`/progress/lessons/${lessonId}/complete/`)
  return response.data
}

export const getCourseProgress = async (courseId) => {
  const response = await api.get(`/progress/courses/${courseId}/`)
  return response.data
}

export default api
