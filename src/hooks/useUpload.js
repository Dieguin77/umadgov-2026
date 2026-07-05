import { useState } from 'react'
import { uploadService } from '@/services/uploadService'
import { orderService } from '@/services/orderService'
import { validateFile } from '@/utils/validators'
import toast from 'react-hot-toast'

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadComprovante = async (file, orderId, numeroPedido) => {
    console.log('[useUpload] arquivo selecionado', {
      nome: file.name,
      tipo: file.type,
      tamanhoMB: (file.size / 1024 / 1024).toFixed(2),
      orderId,
      numeroPedido,
    })

    const validationError = validateFile(file)
    if (validationError) {
      console.warn('[useUpload] falhou na validação local', validationError)
      toast.error(validationError)
      return null
    }

    let step = 'storage'
    try {
      setUploading(true)
      setProgress(30)

      const filePath = await uploadService.uploadComprovante(file, numeroPedido)
      setProgress(70)

      step = 'banco'
      await orderService.updateComprovante(orderId, filePath)
      setProgress(100)

      toast.success('Comprovante enviado com sucesso!')
      return filePath
    } catch (err) {
      // DIAGNÓSTICO TEMPORÁRIO: mostra a etapa + erro completo do Postgres/Storage
      // (code/details/hint) para identificar a causa exata reportada no mobile.
      console.error('[useUpload] erro no envio do comprovante', { step, err, code: err.code, details: err.details, hint: err.hint, status: err.status })
      toast.error(`[DEBUG ${step}] ${err.message} ${err.code ? `(code: ${err.code})` : ''} ${err.details ? `— ${err.details}` : ''}`, { duration: 15000 })
      return null
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return { uploading, progress, uploadComprovante }
}
