import axios from "axios"

const api = axios.create({
  baseURL: "/api",
})

// Interceptador para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptador para renovar token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")
        const response = await axios.post("/api/auth/refresh-token", {
          refreshToken,
        })

        localStorage.setItem("accessToken", response.data.accessToken)
        api.defaults.headers.Authorization = `Bearer ${response.data.accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api
