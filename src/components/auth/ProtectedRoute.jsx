import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

function AuthSpinner() {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
      <p className="text-lavanda-300 text-sm font-medium">Verificando acesso...</p>
    </div>
  )
}

export default function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <AuthSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return children
}
