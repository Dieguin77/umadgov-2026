import { Link } from 'react-router-dom'
import { Instagram, Phone, MapPin, Heart } from 'lucide-react'
import logoIcon from '@/assets/images/logo/logo-umadgov-icon.png'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-lavanda-950 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoIcon}
                alt="UMADGOV"
                className="w-12 h-12 object-contain"
              />
              <div>
                <p className="font-black text-xl leading-tight">UMADGOV</p>
                <p className="text-dourado-400 text-sm font-semibold">2026</p>
              </div>
            </div>
            <p className="text-lavanda-300 font-semibold text-lg mb-1 italic">
              "Vós sois geração eleita"
            </p>
            <p className="text-dourado-400 text-sm mb-5">I Pedro 2:9</p>
            <p className="text-lavanda-400 text-sm leading-relaxed max-w-sm">
              Encomende já a camisa oficial da UMADGOV 2026 e faça parte desta geração eleita para os propósitos de Deus.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Navegação</h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Início' },
                { to: '/pedido', label: 'Encomendar' },
                { to: '/enviar-comprovante', label: 'Enviar Comprovante' },
                { to: '/consulta', label: 'Consultar Pedido' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-lavanda-400 hover:text-dourado-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-lavanda-400 text-sm">
                <Instagram size={16} className="text-dourado-400 shrink-0" />
                <a
                  href="https://instagram.com/umadgov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-dourado-400 transition-colors"
                >
                  @umadgov
                </a>
              </li>
              <li className="flex items-center gap-2 text-lavanda-400 text-sm">
                <Phone size={16} className="text-dourado-400 shrink-0" />
                <a href="tel:+5533999186633" className="hover:text-dourado-400 transition-colors">
                  (33) 99918-6633
                </a>
              </li>
              <li className="flex items-center gap-2 text-lavanda-400 text-sm">
                <Phone size={16} className="text-dourado-400 shrink-0" />
                <a href="tel:+5533991060488" className="hover:text-dourado-400 transition-colors">
                  (33) 99106-0488
                </a>
              </li>
              <li className="flex items-start gap-2 text-lavanda-400 text-sm">
                <MapPin size={16} className="text-dourado-400 shrink-0 mt-0.5" />
                <span>Templo Sede</span>
              </li>
            </ul>

            <div className="mt-6">
              <p className="text-lavanda-500 text-xs mb-1">Prazo de encomenda:</p>
              <p className="text-dourado-400 font-bold">23/09/2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-lavanda-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-lavanda-500 text-xs">
            © {year} UMADGOV — Todos os direitos reservados
          </p>
          <p className="text-lavanda-600 text-xs flex items-center gap-1">
            Feito com <Heart size={12} className="text-dourado-500" /> para a glória de Deus
          </p>
        </div>
      </div>
    </footer>
  )
}
