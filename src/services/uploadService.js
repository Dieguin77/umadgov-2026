import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from '@/lib/supabase'

export const uploadService = {
  async uploadComprovante(file, numeroPedido) {
    const ext = file.name.split('.').pop().toLowerCase()
    // Sufixo aleatório além do timestamp: evita colisão de nome (e portanto
    // um upsert virar UPDATE, que não tem política de RLS) quando duas
    // tentativas de upload acontecem no mesmo milissegundo (retry de rede
    // instável ou duplo toque no mobile).
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const fileName = `${numeroPedido}-comprovante-${unique}.${ext}`
    const filePath = `${fileName}`

    console.log('[uploadService] iniciando upload', {
      bucket: STORAGE_BUCKET,
      filePath,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, { upsert: true })

      console.log('[uploadService] resposta do Supabase Storage', { data, error })

      if (error) throw error
      return filePath
    }

    // Mock: simula upload retornando o path
    await new Promise(r => setTimeout(r, 1500))
    return `mock/${filePath}`
  },

  async getComprovanteUrl(filePath) {
    if (!filePath) return null

    if (filePath.startsWith('mock/')) {
      return null
    }

    if (isSupabaseConfigured) {
      const { data } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(filePath, 3600)
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
