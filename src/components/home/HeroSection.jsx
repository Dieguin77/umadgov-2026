import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, ChevronDown, Star } from 'lucide-react'
import camisaMockup from '@/assets/images/shirts/camisa-mockup.png'
import logoOficial from '@/assets/logo/logooficial.png'

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-32 w-96 h-96 bg-lavanda-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-32 w-96 h-96 bg-dourado-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lavanda-600/10 rounded-full blur-3xl" />
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-dourado-300 rounded-full"
            style={{
              top: `${10 + (i * 7) % 80}%`,
              left: `${5 + (i * 8) % 90}%`,
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Text content */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="text-center lg:text-left"
          >
            {/* Logo + Event badge */}
            <motion.div variants={fadeUp} className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <img
                src={logoOficial}
                alt="UMADGOV Logo"
                className="h-14 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))' }}
              />
              <div className="bg-white/10 border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
                <Star size={13} className="text-dourado-400 fill-dourado-400" />
                <span className="text-white/90 text-sm font-bold tracking-wide">UMADGOV 2026</span>
                <Star size={13} className="text-dourado-400 fill-dourado-400" />
              </div>
            </motion.div>

            {/* Verse reference */}
            <motion.p variants={fadeUp} className="text-dourado-400 font-bold text-sm uppercase tracking-[0.3em] mb-3">
              I Pedro 2:9
            </motion.p>

            {/* Main title */}
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight mb-4">
              Vós sois{' '}
              <span className="text-transparent bg-clip-text bg-gradient-gold">
                geração
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-gold">
                eleita
              </span>
            </motion.h1>

            {/* Verse text */}
            <motion.p variants={fadeUp} className="text-lavanda-300 text-base sm:text-lg mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed italic">
              "Mas vós sois a geração eleita, o sacerdócio real, a nação santa, o povo adquirido por Deus"
            </motion.p>

            {/* Stats */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center lg:justify-start gap-6 mb-10">
              <div className="text-center">
                <p className="text-lavanda-400 text-xs uppercase tracking-wider mb-1">Valor unitário</p>
                <p className="text-white font-black text-3xl">R$ 50<span className="text-xl text-lavanda-300">,00</span></p>
              </div>
              <div className="w-px bg-white/20 hidden sm:block" />
              <div className="text-center">
                <p className="text-lavanda-400 text-xs uppercase tracking-wider mb-1">Tamanhos</p>
                <p className="text-white font-bold text-lg">P · M · G · GG · XG</p>
              </div>
              <div className="w-px bg-white/20 hidden sm:block" />
              <div className="text-center">
                <p className="text-lavanda-400 text-xs uppercase tracking-wider mb-1">Prazo</p>
                <p className="text-dourado-400 font-bold text-lg">23/09/2026</p>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                to="/pedido"
                className="inline-flex items-center gap-2 bg-dourado-500 hover:bg-dourado-600 text-white font-bold px-8 py-4 rounded-xl shadow-gold-lg hover:shadow-gold transition-all duration-200 text-lg animate-pulse-gold"
              >
                <ShoppingBag size={22} />
                Encomendar Agora
              </Link>
              <Link
                to="/consulta"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-7 py-4 rounded-xl backdrop-blur-sm transition-all duration-200"
              >
                Consultar Pedido
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Real shirt mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Glow behind the image */}
              <div className="absolute inset-0 bg-lavanda-400/30 blur-3xl scale-90 rounded-full" />

              {/* Real shirt mockup image */}
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl">
                <img
                  src={camisaMockup}
                  alt="Camisa UMADGOV 2026 — Frente e Costas"
                  className="w-full max-w-md mx-auto rounded-2xl object-contain"
                  style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }}
                />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 flex items-center gap-2">
                  <div className="w-2 h-2 bg-dourado-400 rounded-full" />
                  <p className="text-white text-xs font-semibold whitespace-nowrap">Camisa Lavanda — UMADGOV 2026</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  )
}
