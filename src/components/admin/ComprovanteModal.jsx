import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, ExternalLink, FileText, Image, Calendar, User, Hash } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDateTime } from '@/utils/formatters'
import { uploadService } from '@/services/uploadService'

export default function ComprovanteModal({ order, isOpen, onClose }) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !order?.comprovante) { setUrl(null); return }
    setLoading(true)
    uploadService.getComprovanteUrl(order.comprovante)
      .then(setUrl)
      .catch(() => setUrl(null))
      .finally(() => setLoading(false))
  }, [isOpen, order?.comprovante])

  if (!isOpen || !order) return null

  const filename = order.comprovante?.split('/').pop() || ''
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(filename)
  const isPdf = /\.pdf$/i.test(filename)
  const hasMockPath = order.comprovante && !url && !loading

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10"
          >
            {/* Header */}
            <div className="bg-lavanda-50 border-b border-lavanda-100 px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-black text-lavanda-900 text-base">Comprovante de Pagamento</h2>
                <p className="text-lavanda-500 text-sm">{order.numeroPedido}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-lavanda-100 text-lavanda-400 hover:text-lavanda-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Order info strip */}
            <div className="px-5 py-3 border-b border-lavanda-50 bg-white flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              <div className="flex items-center gap-1.5 text-lavanda-600">
                <Hash size={13} />
                <span className="font-mono font-bold text-xs">{order.numeroPedido}</span>
              </div>
              <div className="flex items-center gap-1.5 text-lavanda-700">
                <User size={13} />
                <span className="font-semibold">{order.nome}</span>
              </div>
              <StatusBadge status={order.status} />
              {order.comprovanteAt && (
                <div className="flex items-center gap-1.5 text-lavanda-400 text-xs">
                  <Calendar size={12} />
                  <span>Enviado em {formatDateTime(order.comprovanteAt)}</span>
                </div>
              )}
            </div>

            {/* Preview area */}
            <div className="p-5">
              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center h-48">
                  <div className="w-8 h-8 border-2 border-lavanda-200 border-t-lavanda-600 rounded-full animate-spin" />
                </div>
              )}

              {/* No comprovante */}
              {!loading && !order.comprovante && (
                <div className="flex flex-col items-center justify-center h-44 text-lavanda-300 gap-3">
                  <FileText size={40} />
                  <p className="font-semibold text-lavanda-500">Comprovante não enviado</p>
                  <p className="text-xs text-lavanda-400">O cliente ainda não enviou o comprovante</p>
                </div>
              )}

              {/* Image preview (real URL) */}
              {!loading && url && isImage && (
                <div className="rounded-xl overflow-hidden border border-lavanda-100">
                  <img
                    src={url}
                    alt="Comprovante de pagamento"
                    className="w-full object-contain max-h-80"
                  />
                </div>
              )}

              {/* PDF (real URL) */}
              {!loading && url && isPdf && (
                <div className="flex flex-col items-center justify-center h-44 gap-4 bg-lavanda-50 rounded-xl border border-lavanda-100">
                  <FileText size={44} className="text-lavanda-400" />
                  <p className="text-lavanda-700 font-semibold text-sm">{filename}</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-lavanda-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-lavanda-700 transition-colors text-sm"
                  >
                    <ExternalLink size={15} />
                    Abrir PDF em nova aba
                  </a>
                </div>
              )}

              {/* Mock mode — no real URL yet */}
              {!loading && order.comprovante && hasMockPath && (
                <div className="flex flex-col items-center justify-center h-44 gap-3 bg-lavanda-50 rounded-xl border border-dashed border-lavanda-200">
                  {isImage ? (
                    <Image size={40} className="text-lavanda-300" />
                  ) : (
                    <FileText size={40} className="text-lavanda-300" />
                  )}
                  <div className="text-center px-4">
                    <p className="font-semibold text-lavanda-700 text-sm">
                      {isImage ? 'Imagem recebida' : 'PDF recebido'}
                    </p>
                    <p className="text-lavanda-400 text-xs mt-1 font-mono break-all">{filename}</p>
                    <p className="text-lavanda-400 text-xs mt-2 italic">
                      Preview disponível após configuração do Supabase Storage
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-3">
              {url && (
                <a
                  href={url}
                  download={filename}
                  className="flex-1 flex items-center justify-center gap-2 bg-lavanda-600 hover:bg-lavanda-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors text-sm"
                >
                  <Download size={15} />
                  Baixar
                </a>
              )}
              {url && isPdf && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 border border-lavanda-200 text-lavanda-600 hover:bg-lavanda-50 px-4 py-2.5 rounded-xl font-bold transition-colors text-sm"
                >
                  <ExternalLink size={15} />
                  Abrir
                </a>
              )}
              <button
                onClick={onClose}
                className="flex-1 border border-lavanda-200 text-lavanda-600 hover:bg-lavanda-50 px-4 py-2.5 rounded-xl font-semibold transition-colors text-sm"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
