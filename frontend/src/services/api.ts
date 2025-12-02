import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/authStore'

// 生产环境直接使用后端地址，开发环境使用代理
const API_BASE_URL = window.location.hostname === 'localhost'
  ? '/api/v1'
  : 'https://sports-vision-cloud.onrender.com/api/v1'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// 认证API
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
}

// 仪表盘API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getOverview: () => api.get('/dashboard/overview'),
}

// 训练API
export const trainingApi = {
  startSession: (deviceId: string, mode = 'standard') =>
    api.post('/training/sessions/start', null, { params: { device_id: deviceId, mode } }),

  endSession: (sessionId: string, metrics: object) =>
    api.post(`/training/sessions/${sessionId}/end`, metrics),

  getSessions: (days = 30) =>
    api.get('/training/sessions', { params: { days } }),

  getStats: (days = 7) =>
    api.get('/training/stats', { params: { days } }),

  getTrends: (days = 30) =>
    api.get('/training/trends', { params: { days } }),

  getAnalysis: (sessionId: string) =>
    api.get(`/training/analysis/${sessionId}`),
}

// 设备API
export const deviceApi = {
  getMyDevices: () => api.get('/devices/'),
  getDevice: (deviceId: string) => api.get(`/devices/${deviceId}`),
  updateConfig: (deviceId: string, config: object) =>
    api.put(`/devices/${deviceId}/config`, config),
  registerDevice: (device: object) => api.post('/devices/register', device),
}

// 用户API
export const userApi = {
  getCurrentUser: () => api.get('/users/me'),
}

export default api
