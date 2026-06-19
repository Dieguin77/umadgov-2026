import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { DollarSign, Calendar, MapPin, Ruler, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import camisaMockup from '@/assets/images/shirts/camisa-mockup.png'
import arteVetores from '@/assets/images/shirts/arte-vetores.png'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
}

function InfoCard({ icon: Icon, title, value, accent, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="initial"
      animate={inView ? 'animate' : 'initial'}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative bg-white rounded-2xl p-6 shadow-sm border overflow-hidden
        ${accent === 'gold' ? 'border-dourado-200' : 'border-lavanda-100'}
      `}
    >
      {accent === 'gold' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-gold" />
      )}
      {accent === 'lavanda' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-lavanda" />
      )}
      <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center mb-4
        ${accent === 'gold' ? 'bg-dourado-100 text-dourado-600' : 'bg-lavanda-100 text-lavanda-600'}
      `}>
        <Icon size={24} />
      </div>
      <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
      <p className={`font-black text-xl ${accent === 'gold' ? 'text-dourado-600' : 'text-lavanda-800'}`}>
        {value}
      </p>
    </motion.div>
  )
}

export default function ShirtInfoSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="camisa" className="py-20 bg-lavanda-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-dourado-600 font-bold text-sm uppercase tracking-widest mb-2">
            Informações
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-lavanda-900 mb-4">
            Camisa Oficial{' '}
            <span className="text-transparent bg-clip-text bg-gradient-lavanda">UMADGOV 2026</span>
          </h2>
          <p className="text-lavanda-500 max-w-xl mx-auto">
            Uma peça exclusiva que representa a identidade desta geração eleita por Deus.
          </p>
        </motion.div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <InfoCard icon={DollarSign} title="Valor por unidade" value="R$ 50,00" accent="gold" delay={0} />
          <InfoCard icon={Calendar} title="Prazo de encomenda" value="23/09/2026" accent="lavanda" delay={0.1} />
          <InfoCard icon={MapPin} title="Local de retirada" value="Templo Sede" accent="lavanda" delay={0.2} />
          <InfoCard icon={Ruler} title="Tamanhos disponíveis" value="P · M · G · GG · XG" accent="gold" delay={0.3} />
        </div>

        {/* Shirt showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: shirt images */}
          <div className="space-y-5">
            {/* Main mockup showing both sides */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-lavanda-100 overflow-hidden"
            >
              <p className="text-xs font-bold text-lavanda-400 uppercase tracking-wider mb-3">
                Frente &amp; Costas
              </p>
              <img
                src={camisaMockup}
                alt="Camisa UMADGOV 2026 — Frente e Costas"
                className="w-full rounded-xl object-contain"
              />
              <p className="text-center text-lavanda-400 text-xs mt-3">
                * Esta imagem é um layout. O produto final pode sofrer variações normais.
              </p>
            </motion.div>

            {/* Arte/vectores preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-lavanda-100 overflow-hidden"
            >
              <p className="text-xs font-bold text-lavanda-400 uppercase tracking-wider mb-3">
                Arte da Estampa
              </p>
              <img
                src={arteVetores}
                alt="Arte da estampa — Vós sois geração eleita"
                className="w-full rounded-xl object-contain"
              />
            </motion.div>
          </div>

          {/* Right: Description */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-2xl sm:text-3xl font-black text-lavanda-900 mb-5 leading-tight">
              Uma camisa feita para quem{' '}
              <span className="text-transparent bg-clip-text bg-gradient-lavanda">pertence a Deus</span>
            </h3>
            <p className="text-lavanda-600 mb-8 leading-relaxed">
              Com design exclusivo na cor lavanda, esta camisa é a expressão visual do tema UMADGOV 2026:{' '}
              <strong>"Vós sois geração eleita"</strong> — I Pedro 2:9. A estampa traz uma pomba com coroa,
              símbolo do Espírito Santo e da realeza do povo de Deus.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { label: 'Cor', value: 'Lavanda' },
                { label: 'Estampa Frente', value: 'Logo UMADGOV + I Pedro 2:9' },
                { label: 'Estampa Costas', value: 'Pomba com coroa + Geração Eleita' },
                { label: 'Tamanhos', value: 'P, M, G, GG, XG' },
                { label: 'Pagamento', value: 'Pix' },
                { label: 'Retirada', value: 'Templo Sede' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-lavanda-100">
                  <span className="text-lavanda-500 text-sm">{item.label}</span>
                  <span className="text-lavanda-800 font-semibold text-sm">{item.value}</span>
                </div>
              ))}
            </div>

            <Link
              to="/pedido"
              className="inline-flex items-center gap-2 bg-gradient-lavanda text-white font-bold px-7 py-3.5 rounded-xl shadow-lavanda hover:shadow-lavanda-lg transition-all duration-200"
            >
              <ShoppingBag size={20} />
              Fazer meu pedido — R$ 50,00
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
