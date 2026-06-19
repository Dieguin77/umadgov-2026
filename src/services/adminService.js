const ADMIN_SESSION_KEY = 'umadgov_admin_session'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'umadgov2026@admin'

export const adminService = {
  login(password) {
    if (password === ADMIN_PASSWORD) {
      const session = { loggedAt: new Date().toISOString(), expires: Date.now() + 8 * 60 * 60 * 1000 }
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
      return true
    }
    return false
  },

  logout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
  },

  isAuthenticated() {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY)
    if (!raw) return false
    try {
      const session = JSON.parse(raw)
      if (Date.now() > session.expires) {
        this.logout()
        return false
      }
      return true
    } catch {
      return false
    }
  },
}
