// src/store/authStore.js — Estado de autenticación admin
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../lib/api'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await authApi.login(email, password)
        localStorage.setItem('mc_token', data.token)
        set({ user: data.user, token: data.token, isAuthenticated: true })
        return data
      },

      logout: () => {
        localStorage.removeItem('mc_token')
        localStorage.removeItem('mc_user')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'mc-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)

export default useAuthStore
