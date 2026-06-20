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

/*
  SQL para criar a tabela no Supabase:

  CREATE TABLE pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "numeroPedido" TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    congregacao TEXT NOT NULL,
    tamanho TEXT NOT NULL CHECK (tamanho IN ('P','M','G','GG','XG')),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valor NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'aguardando_pagamento'
      CHECK (status IN (
        'aguardando_pagamento',
        'comprovante_enviado',
        'pagamento_aprovado',
        'separado_retirada',
        'entregue'
      )),
    comprovante TEXT,
    observacoes TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
  );

  -- Habilitar RLS
  ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

  -- Policy: leitura pública (para o cliente consultar seu pedido por número)
  CREATE POLICY "pedidos_select_public" ON pedidos
    FOR SELECT USING (true);

  -- Policy: inserção pública (para criar pedidos)
  CREATE POLICY "pedidos_insert_public" ON pedidos
    FOR INSERT WITH CHECK (true);

  -- Policy: atualização pública (para enviar comprovante)
  CREATE POLICY "pedidos_update_public" ON pedidos
    FOR UPDATE USING (true);

  -- Storage bucket: comprovantes
  INSERT INTO storage.buckets (id, name, public) VALUES ('comprovantes', 'comprovantes', false);

  CREATE POLICY "upload_comprovante" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'comprovantes');

  CREATE POLICY "view_comprovante" ON storage.objects
    FOR SELECT USING (bucket_id = 'comprovantes');
*/
