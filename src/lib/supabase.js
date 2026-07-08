import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'comprovantes'

export const isSupabaseConfigured =
  supabaseUrl && supabaseUrl !== '' &&
  supabaseAnonKey && supabaseAnonKey !== ''

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'umadgov_auth_v2',
      },
    })
  : null

// SQL completo em: supabase-setup.sql (raiz do projeto)
