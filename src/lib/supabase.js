import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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

export const STORAGE_BUCKET = 'comprovantes'

// SQL completo em: supabase-setup.sql (raiz do projeto)
