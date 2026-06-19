import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { SHIRT_SIZES } from '@/data/mockOrders'

const sizeDescriptions = {
  P:  { chest: '88–92', length: '66', sleeve: '19' },
  M:  { chest: '92–96', length: '68', sleeve: '20' },
  G:  { chest: '96–100', length: '70', sleeve: '21' },
  GG: { chest: '100–104', length: '72', sleeve: '22' },
  XG: { chest: '104–110', length: '74', sleeve: '23' },
}

export default function SizesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-dourado-600 font-bold text-sm uppercase tracking-widest mb-2">Tamanhos</p>
          <h2 className="text-3xl sm:text-4xl font-black text-lavanda-900 mb-3">
            Escolha o seu tamanho
          </h2>
          <p className="text-lavanda-500">Medidas em centímetros. Em caso de dúvida, prefira o maior tamanho.</p>
        </motion.div>

        {/* Size cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-14">
          {SHIRT_SIZES.map((size, i) => (
            <motion.div
              key={size}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="group bg-lavanda-50 border-2 border-lavanda-100 hover:border-lavanda-500 hover:bg-lavanda-600 rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lavanda"
            >
              <div className="text-3xl font-black text-lavanda-700 group-hover:text-white mb-2 transition-colors">
                {size}
              </div>
              <div className="text-xs text-lavanda-400 group-hover:text-lavanda-200 transition-colors space-y-1">
                <p>Peito: {sizeDescriptions[size].chest}cm</p>
                <p>Comp: {sizeDescriptions[size].length}cm</p>
                <p>Manga: {sizeDescriptions[size].sleeve}cm</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center bg-gradient-hero rounded-2xl p-10 text-white"
        >
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            Pronto para encomendar?
          </h3>
          <p className="text-lavanda-300 mb-7 max-w-md mx-auto">
            Garanta a sua camisa antes do prazo de <strong className="text-dourado-400">23/09/2026</strong>. Quantidade limitada!
          </p>
          <Link
            to="/pedido"
            className="inline-flex items-center gap-2 bg-dourado-500 hover:bg-dourado-600 text-white font-bold px-8 py-4 rounded-xl shadow-gold-lg transition-all duration-200 text-lg"
          >
            Encomendar Agora — R$ 50,00
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
