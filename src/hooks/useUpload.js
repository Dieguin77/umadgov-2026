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
      console.error('[useUpload] erro no envio do comprovante', err)
      const isUnsupportedType = /mime type|invalid_mime_type/i.test(err.message || '')
      const isRlsError = /row-level security/i.test(err.message || '')
      toast.error(
        isUnsupportedType
          ? 'Este formato de arquivo não foi aceito pelo servidor. Tente novamente ou envie como JPG, PNG ou PDF.'
          : isRlsError
          ? 'Não foi possível enviar agora. Aguarde alguns segundos e tente novamente.'
          : 'Erro ao enviar comprovante: ' + err.message
      )
      return null
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return { uploading, progress, uploadComprovante }
}
