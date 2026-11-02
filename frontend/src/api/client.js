import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach JWT Access Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fb_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Auto-refresh expired tokens
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('fb_refresh_token')
      if (!refreshToken) {
        isRefreshing = false
        localStorage.removeItem('fb_access_token')
        localStorage.removeItem('fb_user')
        window.dispatchEvent(new Event('fb:auth-logout'))
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })
        const { accessToken, refreshToken: newRefreshToken, user } = response.data

        localStorage.setItem('fb_access_token', accessToken)
        if (newRefreshToken) {
          localStorage.setItem('fb_refresh_token', newRefreshToken)
        }
        if (user) {
          localStorage.setItem('fb_user', JSON.stringify(user))
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('fb_access_token')
        localStorage.removeItem('fb_refresh_token')
        localStorage.removeItem('fb_user')
        window.dispatchEvent(new Event('fb:auth-logout'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

// Pre-configured Auth API functions
export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  getMe: () => apiClient.get('/auth/me'),
}

// Profile API functions (Rule 2)
export const profileApi = {
  getBusinessProfile: () => apiClient.get('/profiles/business'),
  createBusinessProfile: (data) => apiClient.post('/profiles/business', data),
  updateBusinessProfile: (data) => apiClient.put('/profiles/business', data),
  getCharityProfile: () => apiClient.get('/profiles/charity'),
  createCharityProfile: (data) => apiClient.post('/profiles/charity', data),
  updateCharityProfile: (data) => apiClient.put('/profiles/charity', data),
}

// Admin Verification API functions (Rule 1 & Rule 2)
export const adminApi = {
  getPendingVerifications: () => apiClient.get('/admin/verifications/pending'),
  getVerificationDetails: (type, id) => apiClient.get(`/admin/verifications/${type}/${id}`),
  decideVerification: (type, id, data) => apiClient.post(`/admin/verifications/${type}/${id}/decide`, data),
}

// Food Listings API (Rule 2 & Rule 7)
export const foodListingApi = {
  createListing: (data) => apiClient.post('/food-listings', data),
  getMyListings: () => apiClient.get('/food-listings/my-listings'),
}

