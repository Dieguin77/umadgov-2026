import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldX } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import logoOficial from '@/assets/logo/logooficial.png'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Preencha o e-mail e a senha')
      return
    }

    if (!supabase) {
      setError('Serviço não configurado. Contate o suporte.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Autenticar no Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        if (
          authError.message.includes('Invalid login credentials') ||
          authError.message.includes('invalid_credentials')
        ) {
          setError('E-mail ou senha incorretos')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Confirme seu e-mail antes de entrar')
        } else {
          setError('Erro ao fazer login. Tente novamente.')
        }
        return
      }

      // 2. Verificar role na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, nome')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profileData) {
        await supabase.auth.signOut()
        setError('Perfil não encontrado. Contate o administrador.')
        return
      }

      if (profileData.role !== 'admin' && profileData.role !== 'moderador') {
        await supabase.auth.signOut()
        setError('Usuário não autorizado. Acesso restrito a administradores.')
        return
      }

      toast.success(`Bem-vindo, ${profileData.nome || 'Admin'}!`)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
      console.error('[AdminLogin]', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8"
      >
        {/* Logo + titulo */}
        <div className="text-center mb-8">
          <div className="mb-3">
            <img
              src={logoOficial}
              alt="UMADGOV"
              className="h-20 w-auto object-contain mx-auto"
            />
          </div>
          <h1 className="text-2xl font-black text-lavanda-900">Acesso Admin</h1>
          <p className="text-lavanda-400 text-sm mt-1">UMADGOV 2026 — Área Restrita</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* E-mail */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lavanda-400 pointer-events-none">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="E-mail"
              autoComplete="email"
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-lavanda-200 focus:border-lavanda-500 focus:outline-none focus:ring-2 focus:ring-lavanda-100 transition-all disabled:opacity-60"
            />
          </div>

          {/* Senha */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-lavanda-400 pointer-events-none">
              <Lock size={18} />
            </div>
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              placeholder="Senha"
              autoComplete="current-password"
              disabled={loading}
              className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-lavanda-200 focus:border-lavanda-500 focus:outline-none focus:ring-2 focus:ring-lavanda-100 transition-all disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lavanda-400 hover:text-lavanda-600 transition-colors"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Mensagem de erro */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  <ShieldX size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" fullWidth size="lg" loading={loading} icon={LogIn}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-center text-lavanda-400 text-xs mt-6">
          Acesso restrito à equipe UMADGOV
        </p>
      </motion.div>
    </div>
  )
}
