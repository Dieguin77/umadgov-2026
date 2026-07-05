import { useState } from 'react'
import { uploadService } from '@/services/uploadService'
import { orderService } from '@/services/orderService'
import { validateFile } from '@/utils/validators'
import toast from 'react-hot-toast'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Instabilidades transitórias da infraestrutura do Supabase (fora do nosso
// controle) às vezes rejeitam uma requisição válida com esse tipo de erro,
// mas a mesma requisição já passa a funcionar segundos depois — por isso
// vale tentar de novo automaticamente antes de mostrar erro ao usuário.
const isTransientError = (err) => /row-level security|timeout|network|fetch failed/i.test(err?.message || '')

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

    const attempt = async () => {
      const filePath = await uploadService.uploadComprovante(file, numeroPedido)
      await orderService.updateComprovante(orderId, filePath)
      return filePath
    }

    try {
      setUploading(true)
      setProgress(30)

      let filePath
      try {
        filePath = await attempt()
      } catch (err) {
        console.warn('[useUpload] 1ª tentativa falhou, tentando novamente em 2s', err)
        if (!isTransientError(err)) throw err
        setProgress(50)
        await sleep(2000)
        filePath = await attempt()
      }

      setProgress(100)
      toast.success('Comprovante enviado com sucesso!')
      return filePath
    } catch (err) {
      console.error('[useUpload] erro no envio do comprovante (após retry)', err)
      const isUnsupportedType = /mime type|invalid_mime_type/i.test(err.message || '')
      toast.error(
        isUnsupportedType
          ? 'Este formato de arquivo não foi aceito pelo servidor. Tente novamente ou envie como JPG, PNG ou PDF.'
          : 'Não foi possível enviar agora. Aguarde alguns instantes e tente novamente.'
      )
      return null
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return { uploading, progress, uploadComprovante }
}
