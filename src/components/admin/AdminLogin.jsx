import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'
import logoOficial from '@/assets/logo/logooficial.png'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const { login } = useAdmin()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) { toast.error('Digite a senha'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const ok = login(password)
    if (!ok) {
      toast.error('Senha incorreta')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <img
              src={logoOficial}
              alt="UMADGOV"
              className="h-20 w-auto object-contain mx-auto"
            />
          </div>
          <h1 className="text-2xl font-black text-lavanda-900">Admin</h1>
          <p className="text-lavanda-400 text-sm mt-1">UMADGOV 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lavanda-400 z-10">
              <Lock size={18} />
            </div>
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de acesso"
              className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-lavanda-200 focus:border-lavanda-500 focus:outline-none focus:ring-2 focus:ring-lavanda-100 transition-all"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lavanda-400 hover:text-lavanda-600 transition-colors"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} icon={Lock}>
            Entrar
          </Button>
        </form>

        <p className="text-center text-lavanda-400 text-xs mt-6">
          Acesso restrito à equipe UMADGOV
        </p>
      </motion.div>
    </div>
  )
}
