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
  getAvailable: () => apiClient.get('/food-listings/available'),
  getById: (id) => apiClient.get(`/food-listings/${id}`),
}

// Food Rescue Workflow API
export const foodRescueApi = {
  createRequest: (data) => apiClient.post('/food-rescue/requests', data),
  getCharityRequests: () => apiClient.get('/food-rescue/charity-requests'),
  getRestaurantRequests: () => apiClient.get('/food-rescue/restaurant-requests'),
  decideRequest: (id, data) => apiClient.post(`/food-rescue/requests/${id}/decide`, data),
  markCollected: (id, params = {}) => apiClient.post(`/food-rescue/requests/${id}/collect`, null, { params }),
}

// Grocery Discount & Coupon API
export const groceryApi = {
  createOffer: (data) => apiClient.post('/grocery/offers', data),
  getPublicOffers: (params) => apiClient.get('/grocery/offers', { params }),
  getMyOffers: () => apiClient.get('/grocery/offers/my'),
  getOfferById: (id) => apiClient.get(`/grocery/offers/${id}`),
  reserveOffer: (offerId, data) => apiClient.post(`/grocery/offers/${offerId}/reserve`, data),
  getMyReservations: () => apiClient.get('/grocery/reservations/my'),
  cancelReservation: (reservationId) => apiClient.post(`/grocery/reservations/${reservationId}/cancel`),
  verifyRedemptionCode: (data) => apiClient.post('/grocery/redemptions/verify', data),
  confirmRedemption: (data) => apiClient.post('/grocery/redemptions/confirm', data),
  getBusinessRedemptions: () => apiClient.get('/grocery/redemptions/business'),
}

// Rural Community Campaigns API
export const campaignApi = {
  createCampaign: (data) => apiClient.post('/campaigns', data),
  getPublicCampaigns: (params) => apiClient.get('/campaigns', { params }),
  getCampaignById: (id) => apiClient.get(`/campaigns/${id}`),
  getMyCampaigns: () => apiClient.get('/campaigns/my'),
  postCampaignUpdate: (id, data) => apiClient.post(`/campaigns/${id}/updates`, data),
  getCampaignUpdates: (id) => apiClient.get(`/campaigns/${id}/updates`),
  pledgeToCampaign: (id, data) => apiClient.post(`/campaigns/${id}/pledge`, data),
  getPendingCampaigns: () => apiClient.get('/admin/campaigns/pending'),
  moderateCampaign: (id, data) => apiClient.post(`/admin/campaigns/${id}/moderate`, data),
}

// Campaign Contribution Tracking API (WITHOUT payment processing)
export const contributionApi = {
  pledgeContribution: (campaignId, data) => apiClient.post(`/campaigns/${campaignId}/contributions`, data),
  getMyContributions: () => apiClient.get('/contributions/my'),
  getContributionById: (id) => apiClient.get(`/contributions/${id}`),
  getCharityContributions: (params) => apiClient.get('/charity/contributions', { params }),
  confirmContribution: (id, data) => apiClient.post(`/contributions/${id}/confirm`, data || {}),
  recordDistribution: (id, data) => apiClient.post(`/contributions/${id}/distribute`, data),
}

// Business-to-Charity Partnership API
export const partnershipApi = {
  proposePartnership: (data) => apiClient.post('/partnerships/propose', data),
  counterProposal: (id, data) => apiClient.post(`/partnerships/${id}/counter`, data),
  acceptPartnership: (id, data) => apiClient.post(`/partnerships/${id}/accept`, data || {}),
  declinePartnership: (id, data) => apiClient.post(`/partnerships/${id}/decline`, data),
  deliverSupport: (id, data) => apiClient.post(`/partnerships/${id}/deliver`, data),
  confirmReceiptAndComplete: (id, data) => apiClient.post(`/partnerships/${id}/complete`, data),
  postMessage: (id, data) => apiClient.post(`/partnerships/${id}/messages`, data),
  getPartnershipDetails: (id) => apiClient.get(`/partnerships/${id}`),
  getMyBusinessPartnerships: () => apiClient.get('/partnerships/business/my'),
  getMyCharityPartnerships: () => apiClient.get('/partnerships/charity/my'),
  getCampaignRecognitions: (campaignId) => apiClient.get(`/partnerships/campaign/${campaignId}/recognitions`),
  getBusinessRecognitions: (businessId) => apiClient.get(`/partnerships/business/${businessId}/recognitions`),
  getAdminPartnerships: (params) => apiClient.get('/partnerships/admin', { params }),
}

// Explore Map API (OpenStreetMap & Leaflet)
export const mapApi = {
  getExploreMarkers: (params) => apiClient.get('/map/explore', { params }),
  getMapPins: (params) => apiClient.get('/map/pins', { params }),
}

// Impact Statistics & Transparency API
export const impactApi = {
  getPlatformSummary: (params) => apiClient.get('/impact/summary', { params }),
  getPlatformStats: (params) => apiClient.get('/impact/stats', { params }),
  getOrganizationImpact: (organizationId, params) => apiClient.get(`/impact/organization/${organizationId}`, { params }),
  getMyImpact: (params) => apiClient.get('/impact/my', { params }),
  getExportCsvUrl: (organizationId, startDate, endDate) => {
    const params = new URLSearchParams()
    if (organizationId) params.append('organizationId', organizationId)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const base = import.meta.env.VITE_API_BASE_URL || '/api'
    return `${base}/impact/export?${params.toString()}`
  },
}

// Business Public Directory & Profile API
export const businessApi = {
  getPublicBusinesses: (params) => apiClient.get('/public/businesses', { params }),
  getPublicBusinessProfile: (id) => apiClient.get(`/public/businesses/${id}`),
}

// Promotions & Growth API (Featured listings, Promotional offers, Promo analytics)
export const promotionApi = {
  getMyPromotions: () => apiClient.get('/promotions/my'),
  getMyAnalytics: () => apiClient.get('/promotions/analytics'),
  createPromotion: (data) => apiClient.post('/promotions', data),
  updatePromotion: (id, data) => apiClient.put(`/promotions/${id}`, data),
  toggleStatus: (id) => apiClient.patch(`/promotions/${id}/toggle-status`),
  deletePromotion: (id) => apiClient.delete(`/promotions/${id}`),

  // Public promotions & event analytics
  getPublicPromotions: () => apiClient.get('/public/promotions'),
  getFeaturedPromotions: () => apiClient.get('/public/promotions/featured'),
  getPromotionById: (id) => apiClient.get(`/public/promotions/${id}`),
  recordView: (id) => apiClient.post(`/public/promotions/${id}/view`),
  recordClick: (id) => apiClient.post(`/public/promotions/${id}/click`),
  recordRedeem: (id) => apiClient.post(`/public/promotions/${id}/redeem`),

  // Admin controls
  getAllPromotions: () => apiClient.get('/admin/promotions'),
  togglePromotionFeatured: (id, featured) => apiClient.put(`/admin/promotions/${id}/feature?featured=${featured}`),
  getAllBusinesses: () => apiClient.get('/admin/businesses'),
  toggleBusinessFeatured: (id, featured) => apiClient.put(`/admin/businesses/${id}/feature?featured=${featured}`),
}

// In-App Notification Center API
export const notificationApi = {
  getAll: () => apiClient.get('/notifications'),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
}

// Volunteer Opportunities & Participation API
export const volunteerApi = {
  getOpportunities: (params) => apiClient.get('/volunteer/opportunities', { params }),
  getOpportunityById: (id) => apiClient.get(`/volunteer/opportunities/${id}`),
  createOpportunity: (data) => apiClient.post('/volunteer/opportunities', data),
  signUp: (id, data) => apiClient.post(`/volunteer/opportunities/${id}/signup`, data || {}),
  cancelSignUp: (id) => apiClient.post(`/volunteer/opportunities/${id}/cancel`),
  getMyParticipations: () => apiClient.get('/volunteer/my-participations'),
  getAttendees: (id) => apiClient.get(`/volunteer/opportunities/${id}/attendees`),
  markAttendance: (opportunityId, participationId, data) =>
    apiClient.post(`/volunteer/opportunities/${opportunityId}/attendees/${participationId}/attendance`, data),
}





