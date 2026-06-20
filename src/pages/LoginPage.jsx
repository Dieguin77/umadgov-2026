import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import AdminLogin from '@/components/admin/AdminLogin'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
      <p className="text-lavanda-300 text-sm">Carregando...</p>
    </div>
  )
}

export default function LoginPage() {
  const { user, loading, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [user, loading, isAdmin, navigate])

  if (loading) return <LoadingScreen />

  return <AdminLogin />
}
