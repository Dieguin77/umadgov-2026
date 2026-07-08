import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from '@/lib/supabase'

const FALLBACK_MIME_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  pdf: 'application/pdf',
}

const normalizeFileType = (file) => {
  if (file?.type) return file.type
  const ext = file?.name?.split('.').pop()?.toLowerCase()
  return FALLBACK_MIME_TYPES[ext] || ''
}

const mapStorageError = (error) => {
  const message = error?.message || ''
  const details = [error?.details, error?.hint].filter(Boolean).join(' | ')
  const full = `${message} ${details}`.toLowerCase()

  if (/bucket not found|não encontrado|404/.test(full)) {
    return 'Bucket não encontrado. Verifique a configuração do Supabase.'
  }
  if (/permission denied|sem permissão|403/.test(full)) {
    return 'Sem permissão para upload. Verifique as políticas do bucket.'
  }
  if (/file_size_limit|payload too large|arquivo muito grande|413/.test(full)) {
    return 'Arquivo muito grande. Máximo 10MB.'
  }
  if (/mime|invalid file type|tipo de arquivo inválido|unsupported media type/.test(full)) {
    return 'Tipo de arquivo inválido. Aceitos: JPG, JPEG, PNG ou PDF.'
  }
  if (/timeout|network|fetch failed|failed to fetch/.test(full)) {
    return 'Falha na conexão com o Supabase. Tente novamente em alguns instantes.'
  }
  return error?.message || 'Falha ao enviar comprovante para o Supabase.'
}

export const uploadService = {
  async uploadComprovante(file, numeroPedido) {
    const ext = file.name.split('.').pop().toLowerCase()
    const fileType = normalizeFileType(file)
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const fileName = `${numeroPedido}-comprovante-${unique}.${ext}`
    const filePath = `comprovantes/${fileName}`

    if (isSupabaseConfigured) {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          upsert: true,
          contentType: fileType || undefined,
        })

      if (error) {
        const message = mapStorageError(error)
        const uploadError = new Error(message)
        uploadError.original = error
        throw uploadError
      }

      return filePath
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))
    return `mock/${filePath}`
  },

  async getComprovanteUrl(filePath) {
    if (!filePath) return null

    if (filePath.startsWith('mock/')) {
      return null
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(filePath, 3600)

      if (error) {
        console.error('[uploadService] erro ao gerar URL do comprovante', error)
        return null
      }
      return data?.signedUrl || null
    }

    return null
  },

  async deleteComprovante(filePath) {
    if (!filePath || filePath.startsWith('mock/')) return true

    if (isSupabaseConfigured) {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath])
      if (error) throw error
    }
    return true
  },
}
