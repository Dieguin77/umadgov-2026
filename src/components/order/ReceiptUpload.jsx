import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, CheckCircle, Image, FileText } from 'lucide-react'
import { useUpload } from '@/hooks/useUpload'
import { validateFile } from '@/utils/validators'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function ReceiptUpload({ order, onSuccess }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [done, setDone] = useState(false)
  const inputRef = useRef(null)
  const { uploading, progress, uploadComprovante } = useUpload()

  const handleFile = (selectedFile) => {
    const err = validateFile(selectedFile)
    if (err) { toast.error(err); return }

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
    if (!file) return
    const path = await uploadComprovante(file, order.id, order.numeroPedido)
    if (path) {
      setDone(true)
      onSuccess?.()
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
              <p className="text-lavanda-400 text-sm">JPG, JPEG, PNG ou PDF — máximo 10MB</p>
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

      <p className="text-lavanda-400 text-xs text-center">
        Aceitos: JPG, JPEG, PNG, PDF. Máximo: 10MB.
      </p>
    </div>
  )
}
