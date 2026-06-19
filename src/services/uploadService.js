import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from '@/lib/supabase'

export const uploadService = {
  async uploadComprovante(file, numeroPedido) {
    const ext = file.name.split('.').pop().toLowerCase()
    const fileName = `${numeroPedido}-comprovante-${Date.now()}.${ext}`
    const filePath = `${fileName}`

    if (isSupabaseConfigured) {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, { upsert: true })
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
