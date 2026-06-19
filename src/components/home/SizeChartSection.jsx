import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ZoomIn, ZoomOut, X, Ruler, BookOpen, RotateCcw, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const CATEGORIES = [
  {
    id: 'masculino',
    label: 'Tradicional Masculino',
    shortLabel: 'Masculino',
    icon: '👕',
    accent: 'lavanda',
    headerBg: 'bg-lavanda-600',
    rowHighlight: 'bg-lavanda-50',
    badge: 'bg-lavanda-100 text-lavanda-700 border-lavanda-200',
    headers: ['Tamanho', 'Comprimento', 'Largura'],
    rows: [
      { size: 'P',    vals: ['65 cm', '50 cm'] },
      { size: 'M',    vals: ['69 cm', '54 cm'] },
      { size: 'G',    vals: ['72 cm', '57 cm'], popular: true },
      { size: 'GG',   vals: ['76 cm', '61 cm'], popular: true },
      { size: 'XG',   vals: ['82 cm', '63 cm'] },
      { size: 'XXGG', vals: ['87 cm', '70 cm'] },
    ],
  },
  {
    id: 'feminino',
    label: 'Baby Look Feminino',
    shortLabel: 'Baby Look',
    icon: '👗',
    accent: 'dourado',
    headerBg: 'bg-dourado-500',
    rowHighlight: 'bg-dourado-50',
    badge: 'bg-dourado-100 text-dourado-700 border-dourado-200',
    headers: ['Tamanho', 'Comprimento', 'Largura', 'Manga'],
    rows: [
      { size: 'PP', vals: ['51 cm', '39 cm', '38 cm'] },
      { size: 'P',  vals: ['56 cm', '44 cm', '41 cm'] },
      { size: 'M',  vals: ['58 cm', '47 cm', '44 cm'], popular: true },
      { size: 'G',  vals: ['60 cm', '53 cm', '49 cm'], popular: true },
      { size: 'GG', vals: ['63 cm', '56 cm', '52 cm'] },
      { size: 'XG', vals: ['69 cm', '60 cm', '55 cm'] },
    ],
  },
  {
    id: 'infantil',
    label: 'Infantil',
    shortLabel: 'Infantil',
    icon: '🧒',
    accent: 'emerald',
    headerBg: 'bg-emerald-600',
    rowHighlight: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    headers: ['Tamanho', 'Comprimento', 'Largura'],
    rows: [
      { size: '2 anos',       vals: ['39 cm', '33 cm'] },
      { size: '4 anos',       vals: ['43 cm', '34 cm'] },
      { size: 'P (6 anos)',   vals: ['48 cm', '37 cm'] },
      { size: 'M (8 anos)',   vals: ['50 cm', '39 cm'] },
      { size: 'G (10-14 anos)', vals: ['57 cm', '44 cm'] },
    ],
  },
]

function SizeTable({ cat, compact = false }) {
  return (
    <div className="overflow-hidden rounded-xl border border-lavanda-100 shadow-sm">
      {/* Category header */}
      <div className={`${cat.headerBg} px-4 py-3 flex items-center gap-2`}>
        <span className="text-xl">{cat.icon}</span>
        <p className="font-black text-white text-sm tracking-wide">{cat.label.toUpperCase()}</p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-lavanda-50 border-b border-lavanda-100">
            {cat.headers.map(h => (
              <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-lavanda-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cat.rows.map((row, i) => (
            <tr
              key={row.size}
              className={`border-b border-lavanda-50 transition-colors ${
                row.popular ? cat.rowHighlight : i % 2 === 0 ? 'bg-white' : 'bg-lavanda-50/30'
              }`}
            >
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-lavanda-800 text-sm">{row.size}</span>
                  {row.popular && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full border ${cat.badge}`}>
                      Popular
                    </span>
                  )}
                </div>
              </td>
              {row.vals.map((v, vi) => (
                <td key={vi} className="px-3 py-2.5 text-lavanda-700 font-semibold">{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MeasuresModal({ isOpen, onClose }) {
  const [zoom, setZoom] = useState(1)
  const MIN_ZOOM = 0.6
  const MAX_ZOOM = 2.5
  const ZOOM_STEP = 0.2

  const handleZoomIn  = () => setZoom(z => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(1)))
  const handleZoomOut = () => setZoom(z => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(1)))
  const handleReset   = () => setZoom(1)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden z-10"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-lavanda-100 bg-lavanda-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-lavanda-600 rounded-xl flex items-center justify-center">
                  <Ruler size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-black text-lavanda-900 text-base">Guia Completo de Medidas</h2>
                  <p className="text-lavanda-400 text-xs">Todas as categorias — UMADGOV 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                <div className="hidden sm:flex items-center gap-1 bg-white border border-lavanda-200 rounded-xl px-2 py-1">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    className="p-1 rounded-lg hover:bg-lavanda-50 text-lavanda-500 hover:text-lavanda-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Diminuir zoom"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-2 py-0.5 text-xs font-bold text-lavanda-600 hover:text-lavanda-800 min-w-[42px] text-center"
                    title="Redefinir zoom"
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    className="p-1 rounded-lg hover:bg-lavanda-50 text-lavanda-500 hover:text-lavanda-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Aumentar zoom"
                  >
                    <ZoomIn size={15} />
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-lavanda-100 text-lavanda-400 hover:text-lavanda-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Mobile zoom controls */}
            <div className="sm:hidden flex items-center justify-center gap-3 px-5 py-2.5 bg-white border-b border-lavanda-50">
              <button onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM}
                className="p-1.5 rounded-lg border border-lavanda-200 text-lavanda-500 disabled:opacity-30">
                <ZoomOut size={14} />
              </button>
              <button onClick={handleReset} className="text-xs font-bold text-lavanda-600 min-w-[48px] text-center">
                {Math.round(zoom * 100)}%
              </button>
              <button onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM}
                className="p-1.5 rounded-lg border border-lavanda-200 text-lavanda-500 disabled:opacity-30">
                <ZoomIn size={14} />
              </button>
              <button onClick={handleReset} className="p-1.5 rounded-lg border border-lavanda-200 text-lavanda-400">
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-auto p-5">
              <motion.div
                animate={{ scale: zoom }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                style={{ transformOrigin: 'top center' }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-w-[280px]">
                  {CATEGORIES.map(cat => (
                    <div key={cat.id}>
                      <SizeTable cat={cat} />
                    </div>
                  ))}
                </div>

                {/* Tip */}
                <div className="mt-5 bg-lavanda-50 border border-lavanda-100 rounded-xl p-4">
                  <p className="text-lavanda-600 text-sm text-center">
                    <span className="font-bold">💡 Dica:</span> Compare as medidas com uma camisa que você já possui para escolher o tamanho ideal.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Modal footer */}
            <div className="px-5 py-4 border-t border-lavanda-50 bg-lavanda-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <p className="text-lavanda-400 text-xs text-center sm:text-left">
                Medidas em centímetros (cm) · Em caso de dúvida, prefira o tamanho maior
              </p>
              <Link
                to="/pedido"
                onClick={onClose}
                className="flex items-center gap-2 bg-lavanda-600 hover:bg-lavanda-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm shrink-0"
              >
                Encomendar agora
                <ChevronRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function SizeChartSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [activeTab, setActiveTab] = useState('masculino')
  const [modalOpen, setModalOpen] = useState(false)

  const activeCat = CATEGORIES.find(c => c.id === activeTab)

  return (
    <>
      <section ref={ref} className="py-20 bg-lavanda-50" id="medidas">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-lavanda-100 text-lavanda-700 font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              <Ruler size={13} />
              Tabela de Medidas
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-lavanda-900 mb-3">
              Encontre o tamanho{' '}
              <span className="text-transparent bg-clip-text bg-gradient-lavanda">perfeito</span>
            </h2>
            <p className="text-lavanda-500 max-w-lg mx-auto">
              Compare as medidas com uma camisa que você já possui para escolher o tamanho ideal.
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex bg-white border border-lavanda-100 rounded-2xl p-1.5 shadow-sm gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeTab === cat.id
                      ? 'bg-lavanda-600 text-white shadow-md'
                      : 'text-lavanda-500 hover:text-lavanda-700 hover:bg-lavanda-50'
                  }`}
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.shortLabel}</span>
                  <span className="sm:hidden">{cat.shortLabel}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Table */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="max-w-lg mx-auto"
            >
              <SizeTable cat={activeCat} />
            </motion.div>
          </AnimatePresence>

          {/* Tip + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col items-center gap-5"
          >
            {/* Tip box */}
            <div className="w-full max-w-lg bg-white border border-lavanda-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-8 h-8 bg-lavanda-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Ruler size={16} className="text-lavanda-600" />
              </div>
              <div>
                <p className="font-bold text-lavanda-800 text-sm mb-0.5">Como escolher seu tamanho</p>
                <p className="text-lavanda-500 text-sm leading-relaxed">
                  Pegue uma camisa que já veste bem, coloque sobre uma superfície plana e meça comprimento e largura. Compare com a tabela acima.
                </p>
              </div>
            </div>

            {/* Button to open modal */}
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2.5 bg-white border-2 border-lavanda-200 hover:border-lavanda-500 text-lavanda-700 hover:text-lavanda-900 font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-lavanda group"
            >
              <BookOpen size={18} className="group-hover:text-lavanda-600 transition-colors" />
              Ver guia completo de medidas
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      <MeasuresModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
