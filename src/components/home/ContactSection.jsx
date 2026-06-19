import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Instagram, Phone, MapPin, Clock, MessageCircle } from 'lucide-react'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5533999186633'
const WA_MSG = encodeURIComponent('Olá! Gostaria de saber mais sobre a camisa da UMADGOV 2026.')

export default function ContactSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} id="contato" className="py-20 bg-lavanda-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-dourado-600 font-bold text-sm uppercase tracking-widest mb-2">Contato</p>
          <h2 className="text-3xl sm:text-4xl font-black text-lavanda-900 mb-3">
            Fale conosco
          </h2>
          <p className="text-lavanda-500">Dúvidas? Entre em contato pelos nossos canais.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: Instagram,
              title: 'Instagram',
              value: '@umadgov',
              href: 'https://instagram.com/umadgov',
              color: 'bg-gradient-to-br from-purple-500 to-pink-500',
              delay: 0,
            },
            {
              icon: MessageCircle,
              title: 'WhatsApp',
              value: '(33) 99918-6633',
              href: `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`,
              color: 'bg-green-500',
              delay: 0.1,
            },
            {
              icon: Phone,
              title: 'Telefone',
              value: '(33) 99106-0488',
              href: 'tel:+5533991060488',
              color: 'bg-lavanda-600',
              delay: 0.2,
            },
            {
              icon: MapPin,
              title: 'Local de Retirada',
              value: 'Templo Sede — Centro',
              href: 'https://maps.google.com/?q=Rua+Afonso+Pena+3384+Governador+Valadares+MG',
              color: 'bg-dourado-500',
              delay: 0.3,
            },
          ].map(item => (
            <motion.a
              key={item.title}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: item.delay }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-lavanda-100 hover:shadow-lavanda transition-all duration-200 text-center group"
            >
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                <item.icon size={26} className="text-white" />
              </div>
              <p className="text-lavanda-400 text-sm mb-1">{item.title}</p>
              <p className="text-lavanda-800 font-bold">{item.value}</p>
            </motion.a>
          ))}
        </div>

        {/* Church address card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-white rounded-2xl p-6 border border-lavanda-100 shadow-sm mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-lavanda-100 flex items-center justify-center shrink-0">
              <MapPin size={22} className="text-lavanda-600" />
            </div>
            <div className="flex-1">
              <p className="font-black text-lavanda-900 mb-0.5">Igreja Evangélica Assembleia de Deus</p>
              <p className="text-lavanda-500 text-sm">
                Rua Afonso Pena, 3384 · Bairro Centro · Governador Valadares/MG
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=Rua+Afonso+Pena+3384+Governador+Valadares+MG"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-bold text-lavanda-600 hover:text-lavanda-800 border border-lavanda-200 hover:border-lavanda-400 px-3 py-1.5 rounded-lg transition-all"
            >
              Ver no mapa
            </a>
          </div>
        </motion.div>

        {/* Info bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="bg-white rounded-2xl p-6 border border-lavanda-100 shadow-sm flex flex-wrap justify-center gap-6 sm:gap-8"
        >
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-lavanda-500 shrink-0" />
            <div>
              <p className="text-xs text-lavanda-400">Prazo de encomenda</p>
              <p className="font-bold text-lavanda-800">Até 23/09/2026</p>
            </div>
          </div>
          <div className="w-px bg-lavanda-100 hidden sm:block" />
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-lavanda-500 shrink-0" />
            <div>
              <p className="text-xs text-lavanda-400">Local de retirada</p>
              <p className="font-bold text-lavanda-800">Templo Sede — Centro</p>
            </div>
          </div>
          <div className="w-px bg-lavanda-100 hidden sm:block" />
          <div className="flex items-center gap-3">
            <MessageCircle size={20} className="text-green-500 shrink-0" />
            <div>
              <p className="text-xs text-lavanda-400">Atendimento via</p>
              <p className="font-bold text-lavanda-800">WhatsApp</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
