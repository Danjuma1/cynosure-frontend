import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          })
          
          const { access } = response.data
          useAuthStore.getState().setAccessToken(access)
          
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }

    // Fallback for direct-API bypass attempts: the primary flow always
    // pre-checks policy status via usePolicyGate before submitting, but a
    // policy version bump between that check and this request (or any
    // other bypass of the gate) still surfaces a clear message here.
    if (error.response?.data?.error?.code === 'POLICY_REQUIRED') {
      toast.error(error.response.data.error.message || 'Please accept the current policy and try again.')
    }

    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  signup: (data) => api.post('/auth/signup/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (data) => api.post('/auth/logout/', data),
  refreshToken: (data) => api.post('/auth/token/refresh/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  requestPasswordReset: (data) => api.post('/auth/password-reset/', data),
  verifyPasswordResetOTP: (data) => api.post('/auth/password-reset/verify/', data),
  confirmPasswordReset: (data) => api.post('/auth/password-reset/confirm/', data),
  verifyEmail: (data) => api.post('/auth/verify-email/', data),
  resendVerification: () => api.post('/auth/resend-verification/'),
  getFollowings: () => api.get('/auth/followings/'),
  getActivity: () => api.get('/auth/activity/'),
  // Subscription
  getSubscription: () => api.get('/auth/subscription/'),
  updateSubscription: (data) => api.put('/auth/subscription/', data),
  cancelSubscription: () => api.post('/auth/subscription/cancel/'),
}

// Courts endpoints
export const courtsAPI = {
  list: (params) => api.get('/courts/', { params }),
  get: (id) => api.get(`/courts/${id}/`),
  follow: (id) => api.post(`/courts/${id}/follow/`),
  unfollow: (id) => api.post(`/courts/${id}/unfollow/`),
  getDivisions: (id) => api.get(`/courts/${id}/divisions/`),
  getDivision: (id) => api.get(`/courts/divisions/${id}/`),
  getPanels: (courtId) => api.get('/courts/panels/', { params: { court: courtId, ordering: 'name' } }),
  getPanel: (id) => api.get(`/courts/panels/${id}/`),
  getStatistics: (id) => api.get(`/courts/${id}/statistics/`),
  getRules: (id) => api.get(`/courts/${id}/rules/`),
  getHolidays: (id) => api.get(`/courts/${id}/holidays/`),
}

// Judges endpoints
export const judgesAPI = {
  list: (params) => api.get('/judges/', { params }),
  get: (id) => api.get(`/judges/${id}/`),
  follow: (id) => api.post(`/judges/${id}/follow/`),
  unfollow: (id) => api.post(`/judges/${id}/unfollow/`),
  getAvailability: (id, params) => api.get(`/judges/${id}/availability/`, { params }),
  getCauseLists: (id, params) => api.get(`/judges/${id}/cause-lists/`, { params }),
  getStatistics: (id) => api.get(`/judges/${id}/statistics/`),
}

// Cases endpoints
export const casesAPI = {
  list: (params) => api.get('/cases/', { params }),
  get: (id) => api.get(`/cases/${id}/`),
  search: (params) => api.get('/cases/search/', { params }),
  suggestions: (params) => api.get('/cases/suggestions/', { params }),
  follow: (id) => api.post(`/cases/${id}/follow/`),
  unfollow: (id) => api.post(`/cases/${id}/unfollow/`),
  getTimeline: (id) => api.get(`/cases/${id}/timeline/`),
  getHearings: (id) => api.get(`/cases/${id}/hearings/`),
  getDocuments: (id) => api.get(`/cases/${id}/documents/`),
}

// Cause Lists endpoints
export const causeListsAPI = {
  list: (params) => api.get('/cause-lists/', { params }),
  get: (id) => api.get(`/cause-lists/${id}/`),
  create: (data) => api.post('/cause-lists/', data),
  update: (id, data) => api.patch(`/cause-lists/${id}/`, data),
  delete: (id) => api.delete(`/cause-lists/${id}/`),
  updateStatus: (id, data) => api.post(`/cause-lists/${id}/update_status/`, data),
  getDaily: (params) => api.get('/cause-lists/daily/', { params }),
  getByJudge: (params) => api.get('/cause-lists/by-judge/', { params }),
  getByCourt: (params) => api.get('/cause-lists/by-court/', { params }),
  getFuture: (params) => api.get('/cause-lists/future/', { params }),
  getChanges: (id) => api.get(`/cause-lists/${id}/changes/`),
  subscribe: (data) => api.post('/cause-lists/subscriptions/', data),
  unsubscribe: (id) => api.delete(`/cause-lists/subscriptions/${id}/`),
  getSubscriptions: () => api.get('/cause-lists/subscriptions/'),
  // Image endpoints
  getImages: (id) => api.get(`/cause-lists/${id}/images/`),
  uploadImages: (id, formData) =>
    api.post(`/cause-lists/${id}/images/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (causeListId, imageId) =>
    api.delete(`/cause-lists/${causeListId}/images/${imageId}/`),
}

// Notifications endpoints
export const notificationsAPI = {
  list: (params) => api.get('/notifications/', { params }),
  get: (id) => api.get(`/notifications/${id}/`),
  getCounts: () => api.get('/notifications/counts/'),
  markRead: (data) => api.post('/notifications/mark-read/', data),
  markSingleRead: (id) => api.post(`/notifications/${id}/read/`),
  archive: (data) => api.post('/notifications/archive/', data),
  getArchived: () => api.get('/notifications/archived/'),
  getUnread: () => api.get('/notifications/unread/'),
  getPreferences: () => api.get('/notifications/preferences/'),
  updatePreferences: (data) => api.put('/notifications/preferences/', data),
}

// Search endpoints
export const searchAPI = {
  global: (params) => api.get('/search/', { params }),
  cases: (params) => api.get('/search/cases/', { params }),
  causeLists: (params) => api.get('/search/cause-lists/', { params }),
}

// Repository endpoints
export const repositoryAPI = {
  list: (params) => api.get('/repository/', { params }),
  get: (id) => api.get(`/repository/${id}/`),
  listDocuments: (params) => api.get('/repository/documents/', { params }),
  getDocument: (slug) => api.get(`/repository/documents/${slug}/`),
  listCategories: () => api.get('/repository/categories/'),
  bookmark: (slug) => api.post(`/repository/documents/${slug}/bookmark/`),
  unbookmark: (slug) => api.post(`/repository/documents/${slug}/unbookmark/`),
  getBookmarks: () => api.get('/repository/bookmarks/'),
}

// E-Filing endpoints
export const efilingAPI = {
  list: (params) => api.get('/efiling/', { params }),
  get: (id) => api.get(`/efiling/${id}/`),
  create: (data) => api.post('/efiling/', data),
  update: (id, data) => api.patch(`/efiling/${id}/`, data),
  submit: (id) => api.post(`/efiling/${id}/submit/`),
  uploadDocument: (id, data) => api.post(`/efiling/${id}/documents/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

// Brief Connect endpoints
export const briefConnectAPI = {
  // Requests
  listRequests: (params) => api.get('/brief-connect/requests/', { params }),
  getRequest: (id) => api.get(`/brief-connect/requests/${id}/`),
  postRequest: (data) => api.post('/brief-connect/requests/', data),
  updateRequest: (id, data) => api.patch(`/brief-connect/requests/${id}/`, data),
  cancelRequest: (id) => api.delete(`/brief-connect/requests/${id}/`),
  myRequests: (params) => api.get('/brief-connect/requests/my-requests/', { params }),
  myApplications: (params) => api.get('/brief-connect/requests/my-applications/', { params }),

  // Applications
  apply: (requestId, data) => api.post(`/brief-connect/requests/${requestId}/apply/`, data),
  withdrawApplication: (requestId) => api.post(`/brief-connect/requests/${requestId}/withdraw-application/`),
  acceptApplication: (requestId, applicationId) =>
    api.post(`/brief-connect/requests/${requestId}/accept-application/`, { application_id: applicationId }),
  rejectApplication: (requestId, applicationId) =>
    api.post(`/brief-connect/requests/${requestId}/reject-application/`, { application_id: applicationId }),

  // Fee negotiation (counter-offers on a specific application)
  listOffers: (applicationId) => api.get(`/brief-connect/applications/${applicationId}/offers/`),
  counterOffer: (applicationId, data) => api.post(`/brief-connect/applications/${applicationId}/offers/`, data),
  acceptOffer: (applicationId, offerId) =>
    api.post(`/brief-connect/applications/${applicationId}/offers/${offerId}/accept/`),
  declineOffer: (applicationId, offerId) =>
    api.post(`/brief-connect/applications/${applicationId}/offers/${offerId}/decline/`),

  // Engagements
  listEngagements: (params) => api.get('/brief-connect/engagements/', { params }),
  getEngagement: (id) => api.get(`/brief-connect/engagements/${id}/`),
  startEngagement: (id) => api.post(`/brief-connect/engagements/${id}/start/`),
  submitCompletion: (id, data) => {
    const isFormData = data instanceof FormData
    return api.post(`/brief-connect/engagements/${id}/submit-completion/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    })
  },
  confirmCompletion: (id, outcome_notes) =>
    api.post(`/brief-connect/engagements/${id}/confirm-completion/`, { outcome_notes }),
  rejectCompletion: (id, reason) =>
    api.post(`/brief-connect/engagements/${id}/reject-completion/`, { reason }),
  getEscrow: (id) => api.get(`/brief-connect/engagements/${id}/escrow/`),

  // Reviews
  submitReview: (data) => api.post('/brief-connect/reviews/', data),
  listReviews: (params) => api.get('/brief-connect/reviews/', { params }),
}

// Payments (escrow, fee, payout bank accounts)
export const paymentsAPI = {
  getFeeConfig: () => api.get('/payments/fee-config/'),
  listBanks: () => api.get('/payments/banks/'),
  listBankAccounts: () => api.get('/payments/bank-accounts/'),
  addBankAccount: (data) => api.post('/payments/bank-accounts/', data),
  deleteBankAccount: (id) => api.delete(`/payments/bank-accounts/${id}/`),
  initializeEscrow: (engagementId, data) => api.post(`/payments/escrow/${engagementId}/initialize/`, data),
  verifyEscrow: (engagementId, reference) => api.post(`/payments/escrow/${engagementId}/verify/`, { reference }),
}

// Disputes
export const disputesAPI = {
  list: (params) => api.get('/disputes/', { params }),
  get: (id) => api.get(`/disputes/${id}/`),
  addEvidence: (id, data) => {
    const isFormData = data instanceof FormData
    return api.post(`/disputes/${id}/add-evidence/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    })
  },
  resolve: (id, data) => api.post(`/disputes/${id}/resolve/`, data),
}

// Policies endpoints
export const policiesAPI = {
  getPending: (checkpoint) => api.get('/policies/pending/', { params: { checkpoint } }),
  accept: (policyId) => api.post('/policies/accept/', { policy_id: policyId }),
}

// Brief Connect chat endpoints
export const briefChatAPI = {
  listMessages: (engagementId, params) =>
    api.get(`/brief-connect/engagements/${engagementId}/messages/`, { params }),
  sendMessage: (engagementId, data) => {
    const isFormData = data instanceof FormData
    return api.post(`/brief-connect/engagements/${engagementId}/messages/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    })
  },
}

// Admin endpoints
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard/'),
  getAnalytics: () => api.get('/admin/analytics/'),
  // Scrapers
  getScrapers: () => api.get('/admin/scrapers/'),
  getScraperStatus: () => api.get('/admin/scrapers/status/'),
  controlScraper: (data) => api.post('/admin/scrapers/', data),
  runScraper: (type) => api.post(`/admin/scrapers/${type}/run/`),
  // Users
  getUsers: (params) => api.get('/admin/users/', { params }),
  getUser: (id) => api.get(`/admin/users/${id}/`),
  updateUser: (id, data) => api.patch(`/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),
  // Courts (uses public API — admin users have CanManageCourt permission)
  getCourts: (params) => api.get('/courts/', { params }),
  getCourt: (id) => api.get(`/courts/${id}/`),
  createCourt: (data) => api.post('/courts/', data),
  updateCourt: (id, data) => api.patch(`/courts/${id}/`, data),
  deleteCourt: (id) => api.delete(`/courts/${id}/`),
  // Divisions
  getDivisions: (params) => api.get('/courts/divisions/', { params }),
  getDivision: (id) => api.get(`/courts/divisions/${id}/`),
  createDivision: (data) => api.post('/courts/divisions/', data),
  updateDivision: (id, data) => api.patch(`/courts/divisions/${id}/`, data),
  deleteDivision: (id) => api.delete(`/courts/divisions/${id}/`),
  // Judges (uses public API — admin users have CanManageCourt permission)
  getJudges: (params) => api.get('/judges/', { params }),
  getJudge: (id) => api.get(`/judges/${id}/`),
  createJudge: (data) => api.post('/judges/', data),
  updateJudge: (id, data) => api.patch(`/judges/${id}/`, data),
  deleteJudge: (id) => api.delete(`/judges/${id}/`),
  // Cases
  getCases: (params) => api.get('/cases/', { params }),
  getCase: (id) => api.get(`/cases/${id}/`),
  createCase: (data) => api.post('/cases/', data),
  updateCase: (id, data) => api.patch(`/cases/${id}/`, data),
  deleteCase: (id) => api.delete(`/cases/${id}/`),
  // Cause Lists (uses public API — admin users have CanUploadCauseList permission)
  getCauseLists: (params) => api.get('/cause-lists/', { params }),
  getCauseList: (id) => api.get(`/cause-lists/${id}/`),
  createCauseList: (data) => api.post('/cause-lists/', data),
  updateCauseList: (id, data) => api.patch(`/cause-lists/${id}/`, data),
  deleteCauseList: (id) => api.delete(`/cause-lists/${id}/`),
  publishCauseList: (id) => api.post(`/cause-lists/${id}/update_status/`, { status: 'published' }),
  // System
  getSystemStatus: () => api.get('/admin/system/status/'),
  clearCache: () => api.post('/admin/system/clear-cache/'),
  // Audit
  getAuditLogs: (params) => api.get('/admin/audit-logs/', { params }),
}

export default api
