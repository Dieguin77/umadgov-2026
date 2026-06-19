import { createContext, useContext, useState, useEffect } from 'react'
import { adminService } from '@/services/adminService'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsAuthenticated(adminService.isAuthenticated())
    setLoading(false)
  }, [])

  const login = (password) => {
    const ok = adminService.login(password)
    if (ok) setIsAuthenticated(true)
    return ok
  }

  const logout = () => {
    adminService.logout()
    setIsAuthenticated(false)
  }

  return (
    <AdminContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider')
  return ctx
}
