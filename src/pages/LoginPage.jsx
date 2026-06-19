import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '@/context/AdminContext'
import AdminLogin from '@/components/admin/AdminLogin'

export default function LoginPage() {
  const { isAuthenticated } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true })
  }, [isAuthenticated])

  return <AdminLogin />
}
