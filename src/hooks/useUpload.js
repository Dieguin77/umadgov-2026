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

  const uploadComprovante = async (file, numeroPedido) => {
    const validationError = validateFile(file)
    if (validationError) {
      console.warn('[useUpload] falhou na validação local', validationError)
      toast.error(validationError)
      return null
    }

    const attempt = async () => {
      const filePath = await uploadService.uploadComprovante(file, numeroPedido)
      await orderService.updateComprovante(numeroPedido, filePath)
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
      const text = (err?.message || '').toLowerCase()
      const isUnsupportedType = /mime|invalid file type|tipo de arquivo inválido/i.test(text)
      const isPermissionError = /permission denied|sem permissão/i.test(text)
      const isBucketNotFound = /bucket não encontrado|bucket not found/i.test(text)
      const isSizeError = /arquivo muito grande|payload too large|413/i.test(text)
      const isAuthError = /autenticação|invalid token|jwt/i.test(text)
      const isNetworkError = /timeout|network|fetch failed/i.test(text)

      const message = isBucketNotFound
        ? 'Bucket não encontrado. Contate o administrador.'
        : isPermissionError
        ? 'Sem permissão para upload. Verifique as políticas do Supabase.'
        : isSizeError
        ? 'Arquivo muito grande. Máximo 10MB.'
        : isUnsupportedType
        ? 'Tipo de arquivo inválido. Use JPG, PNG ou PDF.'
        : isAuthError
        ? 'Erro de autenticação. Atualize a página e tente novamente.'
        : isNetworkError
        ? 'Falha de conexão com o Supabase. Tente novamente em alguns instantes.'
        : 'Não foi possível enviar agora. Aguarde alguns instantes e tente novamente.'

      toast.error(message)
      return null
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return { uploading, progress, uploadComprovante }
}
