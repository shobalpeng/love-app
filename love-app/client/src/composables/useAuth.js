import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  const authStore = useAuthStore()

  async function login(username, password) {
    return authStore.login(username, password)
  }

  async function register(username, password) {
    return authStore.register(username, password)
  }

  function logout() {
    authStore.logout()
  }

  return {
    user: authStore.user,
    isLoggedIn: authStore.isLoggedIn,
    token: authStore.token,
    login,
    register,
    logout
  }
}
