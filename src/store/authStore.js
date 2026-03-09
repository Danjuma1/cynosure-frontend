import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setTokens: (accessToken, refreshToken) => set({ 
        accessToken, 
        refreshToken,
        isAuthenticated: !!accessToken,
      }),
      
      setAccessToken: (accessToken) => set({ accessToken }),
      
      login: (user, accessToken, refreshToken) => set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      }),

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      setLoading: (isLoading) => set({ isLoading }),

      // Check if user has specific role
      hasRole: (role) => {
        const user = get().user
        return user?.user_type === role
      },

      // Check if user is admin (super_admin or registry_staff)
      isAdmin: () => {
        const user = get().user
        return user?.user_type === 'super_admin' || user?.user_type === 'registry_staff'
      },

      // Check if user is super admin
      isSuperAdmin: () => {
        const user = get().user
        return user?.user_type === 'super_admin'
      },
    }),
    {
      name: 'cynosure-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
