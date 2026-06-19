import { useState } from 'react'
import { uploadService } from '@/services/uploadService'
import { orderService } from '@/services/orderService'
import { validateFile } from '@/utils/validators'
import toast from 'react-hot-toast'

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadComprovante = async (file, orderId, numeroPedido) => {
    const validationError = validateFile(file)
    if (validationError) {
      toast.error(validationError)
      return null
    }

    try {
      setUploading(true)
      setProgress(30)

      const filePath = await uploadService.uploadComprovante(file, numeroPedido)
      setProgress(70)

      await orderService.updateComprovante(orderId, filePath)
      setProgress(100)

      toast.success('Comprovante enviado com sucesso!')
      return filePath
    } catch (err) {
      toast.error('Erro ao enviar comprovante: ' + err.message)
      return null
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return { uploading, progress, uploadComprovante }
}
