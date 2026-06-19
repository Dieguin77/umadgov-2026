import { Link } from 'react-router-dom'
import { LogOut, ExternalLink } from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'
import logoOficial from '@/assets/images/logo/logo-oficial.png'

export default function AdminLayout({ children }) {
  const { logout } = useAdmin()

  return (
    <div className="min-h-screen bg-lavanda-50">
      {/* Admin Header */}
      <header className="bg-lavanda-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-1">
              <img src={logoOficial} alt="UMADGOV" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <span className="font-black text-white">UMADGOV</span>
              <span className="text-lavanda-400 text-sm ml-2">/ Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1.5 text-lavanda-400 hover:text-white text-sm transition-colors"
            >
              <ExternalLink size={14} />
              Ver site
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-lavanda-700 hover:bg-lavanda-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <LogOut size={15} />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}
