import { clsx } from 'clsx'

// Class name utility
export function cn(...inputs) {
  return clsx(inputs)
}

// Format date
export function formatDate(date, options = {}) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

// Format date with time
export function formatDateTime(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format time
export function formatTime(time) {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${minutes} ${ampm}`
}

// Relative time (e.g., "2 hours ago")
export function timeAgo(date) {
  if (!date) return ''
  const now = new Date()
  const past = new Date(date)
  const seconds = Math.floor((now - past) / 1000)
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]
  
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`
    }
  }
  
  return 'Just now'
}

// Truncate text
export function truncate(text, length = 100) {
  if (!text || text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

// Capitalize first letter
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Format number with commas
export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString('en-NG')
}

// Nigerian states
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

// Court types
export const COURT_TYPES = {
  supreme: 'Supreme Court',
  court_of_appeal: 'Court of Appeal',
  federal_high: 'Federal High Court',
  national_industrial: 'National Industrial Court',
  state_high: 'State High Court',
  sharia_court_appeal: 'Sharia Court of Appeal',
  customary_court_appeal: 'Customary Court of Appeal',
  magistrate: 'Magistrate Court',
  customary: 'Customary Court',
  area: 'Area Court',
  other: 'Other',
}

// Case statuses
export const CASE_STATUSES = {
  pending: { label: 'Pending', color: 'warning' },
  active: { label: 'Active', color: 'info' },
  adjourned: { label: 'Adjourned', color: 'neutral' },
  reserved: { label: 'Reserved', color: 'info' },
  judgment: { label: 'Judgment', color: 'success' },
  settled: { label: 'Settled', color: 'success' },
  withdrawn: { label: 'Withdrawn', color: 'neutral' },
  struck_out: { label: 'Struck Out', color: 'error' },
  dismissed: { label: 'Dismissed', color: 'error' },
  transferred: { label: 'Transferred', color: 'neutral' },
  appealed: { label: 'Appealed', color: 'info' },
  concluded: { label: 'Concluded', color: 'success' },
}

// Cause list statuses
export const CAUSE_LIST_STATUSES = {
  draft: { label: 'Draft', color: 'neutral' },
  published: { label: 'Published', color: 'success' },
  sitting: { label: 'In Session', color: 'info' },
  adjourned: { label: 'Adjourned', color: 'warning' },
  not_sitting: { label: 'Not Sitting', color: 'error' },
  risen: { label: 'Risen', color: 'neutral' },
  cancelled: { label: 'Cancelled', color: 'error' },
}

// Judge statuses
export const JUDGE_STATUSES = {
  active: { label: 'Active', color: 'success' },
  on_leave: { label: 'On Leave', color: 'warning' },
  not_sitting: { label: 'Not Sitting', color: 'error' },
  retired: { label: 'Retired', color: 'neutral' },
  transferred: { label: 'Transferred', color: 'neutral' },
  suspended: { label: 'Suspended', color: 'error' },
}

// Get status badge class
export function getStatusBadge(status, statusMap) {
  const statusInfo = statusMap[status] || { label: status, color: 'neutral' }
  return {
    label: statusInfo.label,
    className: `badge badge-${statusInfo.color}`,
  }
}

// Debounce function
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Storage helpers
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Handle storage full
    }
  },
  remove: (key) => {
    localStorage.removeItem(key)
  },
}

// Error message extractor
export function getErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.response?.data?.detail) {
    return error.response.data.detail
  }
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors
    if (typeof errors === 'object') {
      return Object.values(errors).flat().join(', ')
    }
    return errors
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}
