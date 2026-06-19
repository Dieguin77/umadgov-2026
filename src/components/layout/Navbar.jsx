import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag } from 'lucide-react'
import logoIcon from '@/assets/images/logo/logo-umadgov-icon.png'

const navLinks = [
  { to: '/', label: 'Início' },
  { to: '/pedido', label: 'Encomendar' },
  { to: '/consulta', label: 'Meu Pedido' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  const isHome = pathname === '/'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-lavanda-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logoIcon}
              alt="UMADGOV"
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
            />
            <div className="hidden sm:block">
              <p className={`font-black text-base md:text-lg leading-tight transition-colors ${
                scrolled || !isHome ? 'text-lavanda-800' : 'text-white'
              }`}>
                UMADGOV
              </p>
              <p className={`text-xs font-medium leading-tight transition-colors ${
                scrolled || !isHome ? 'text-dourado-600' : 'text-dourado-300'
              }`}>
                2026
              </p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  pathname === link.to
                    ? 'bg-lavanda-100 text-lavanda-700'
                    : scrolled || !isHome
                    ? 'text-lavanda-700 hover:bg-lavanda-50'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/pedido"
              className="flex items-center gap-2 bg-dourado-500 hover:bg-dourado-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-gold hover:shadow-gold-lg transition-all duration-200"
            >
              <ShoppingBag size={16} />
              Encomendar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled || !isHome
                ? 'text-lavanda-700 hover:bg-lavanda-50'
                : 'text-white hover:bg-white/10'
            }`}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-lavanda-100 shadow-lg"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    pathname === link.to
                      ? 'bg-lavanda-100 text-lavanda-700'
                      : 'text-lavanda-700 hover:bg-lavanda-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/pedido"
                className="mt-2 flex items-center justify-center gap-2 bg-dourado-500 text-white px-5 py-3 rounded-xl font-bold shadow-gold"
              >
                <ShoppingBag size={18} />
                Encomendar Agora
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
