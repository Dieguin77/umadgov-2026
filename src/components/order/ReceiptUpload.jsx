import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, CheckCircle, Image, FileText, MessageCircle } from 'lucide-react'
import { useUpload } from '@/hooks/useUpload'
import { validateFile } from '@/utils/validators'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5533999186633'

export default function ReceiptUpload({ order, onSuccess }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [done, setDone] = useState(false)
  const [failed, setFailed] = useState(false)
  const inputRef = useRef(null)
  const submittingRef = useRef(false)
  const { uploading, progress, uploadComprovante } = useUpload()

  const waFallbackHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Olá! Não consegui enviar o comprovante pelo site do pedido ${order?.numeroPedido || ''}, segue em anexo:`
  )}`

  const handleFile = (selectedFile) => {
    const err = validateFile(selectedFile)
    if (err) { toast.error(err); return }

    setFailed(false)
    setFile(selectedFile)
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const handleSubmit = async () => {
    // Trava síncrona contra duplo toque/clique (mobile costuma disparar o
    // evento mais de uma vez antes do React re-renderizar o botão como
    // desabilitado) — impede duas chamadas de upload em paralelo.
    if (!file || submittingRef.current) return
    submittingRef.current = true
    try {
      const path = await uploadComprovante(file, order.numeroPedido)
      if (path) {
        setFailed(false)
        setDone(true)
        onSuccess?.()
      } else {
        setFailed(true)
      }
    } finally {
      submittingRef.current = false
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={42} className="text-green-600" />
        </div>
        <h3 className="text-xl font-black text-lavanda-900 mb-2">Comprovante enviado!</h3>
        <p className="text-lavanda-500 mb-2">
          Recebemos seu comprovante. O status do pedido foi atualizado para{' '}
          <strong>"Comprovante Enviado"</strong>.
        </p>
        <p className="text-lavanda-400 text-sm">
          Aguarde a aprovação do pagamento pela nossa equipe.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !file && inputRef.current?.click()}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${dragging
            ? 'border-lavanda-500 bg-lavanda-50 scale-[1.01]'
            : file
            ? 'border-green-400 bg-green-50'
            : 'border-lavanda-300 hover:border-lavanda-400 hover:bg-lavanda-50'
          }
          ${file ? 'p-4' : 'p-10'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-green-200" />
              ) : (
                <div className="w-16 h-16 bg-lavanda-100 rounded-xl flex items-center justify-center">
                  <FileText size={28} className="text-lavanda-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lavanda-800 truncate">{file.name}</p>
                <p className="text-lavanda-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null) }}
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-14 h-14 bg-lavanda-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload size={28} className="text-lavanda-500" />
              </div>
              <p className="font-bold text-lavanda-700 mb-1">
                {dragging ? 'Solte o arquivo aqui!' : 'Arraste ou clique para selecionar'}
              </p>
              <p className="text-lavanda-400 text-sm">JPG, JPEG, PNG ou PDF | máximo 10MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-lavanda-600">
            <span>Enviando comprovante...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-lavanda-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-lavanda"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        size="lg"
        fullWidth
        loading={uploading}
        disabled={!file}
        icon={Upload}
        className="font-bold"
      >
        {uploading ? 'Enviando...' : 'Enviar Comprovante'}
      </Button>

      {/* Fallback: só aparece se o envio falhar mesmo após a retentativa automática */}
      <AnimatePresence>
        {failed && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-dourado-50 border border-dourado-200 rounded-xl p-4 space-y-2">
              <p className="text-dourado-700 text-sm font-semibold">Não conseguiu enviar?</p>
              <p className="text-dourado-600 text-sm">
                Isso pode acontecer por instabilidade momentânea. Seu pedido já está confirmado mesmo assim — o comprovante é só para agilizar a conferência.
              </p>
              <a
                href={waFallbackHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <MessageCircle size={16} />
                Enviar pelo WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-lavanda-400 text-xs text-center">
        Aceitos: JPG, JPEG, PNG, PDF. Máximo: 10MB.
      </p>
    </div>
  )
}
