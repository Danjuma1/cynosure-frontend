import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  countsByType: {},
  isLoading: false,
  
  setNotifications: (notifications) => set({ notifications }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
  })),
  
  setCounts: (unread, byType) => set({
    unreadCount: unread,
    countsByType: byType,
  }),
  
  markAsRead: (notificationIds) => set((state) => ({
    notifications: state.notifications.map((n) =>
      notificationIds.includes(n.id) ? { ...n, is_read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - notificationIds.length),
  })),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
    unreadCount: 0,
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
  
  clearAll: () => set({
    notifications: [],
    unreadCount: 0,
    countsByType: {},
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
}))

export default useNotificationStore
