-- ============================================================
-- UMADGOV 2026 — Script de Configuração do Supabase
-- Execute INTEIRO no SQL Editor do Supabase (project > SQL Editor)
-- ============================================================


-- ==========================
-- 1. TABELA: profiles
--    (necessária para autenticação admin)
-- ==========================

CREATE TABLE IF NOT EXISTS public.profiles (
  id      UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome    TEXT,
  role    TEXT NOT NULL DEFAULT 'user'
            CHECK (role IN ('admin', 'moderador', 'user')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger: cria perfil automaticamente ao cadastrar um novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================
-- 2. SEQUÊNCIA: numeroPedido
--    (garante números únicos sem race condition)
-- ==========================

CREATE SEQUENCE IF NOT EXISTS public.pedidos_numero_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.set_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
  NEW."numeroPedido" := 'UMD-2026-' || LPAD(nextval('public.pedidos_numero_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==========================
-- 3. TABELA: pedidos
-- ==========================

CREATE TABLE IF NOT EXISTS public.pedidos (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "numeroPedido"   TEXT UNIQUE,
  nome             TEXT NOT NULL,
  telefone         TEXT NOT NULL,
  congregacao      TEXT NOT NULL,
  tamanho          TEXT NOT NULL CHECK (tamanho IN ('P','M','G','GG','XG')),
  quantidade       INTEGER NOT NULL CHECK (quantidade > 0),
  valor            NUMERIC(10,2) NOT NULL,
  status           TEXT NOT NULL DEFAULT 'aguardando_pagamento'
                     CHECK (status IN (
                       'aguardando_pagamento',
                       'comprovante_enviado',
                       'pagamento_aprovado',
                       'separado_retirada',
                       'entregue'
                     )),
  "formaPagamento" TEXT NOT NULL DEFAULT 'pix'
                     CHECK ("formaPagamento" IN ('pix', 'credito', 'debito')),
  comprovante      TEXT,
  "comprovanteAt"  TIMESTAMPTZ,
  observacoes      TEXT,
  "createdAt"      TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: atribui numeroPedido automaticamente ao inserir
DROP TRIGGER IF EXISTS trg_set_numero_pedido ON public.pedidos;
CREATE TRIGGER trg_set_numero_pedido
  BEFORE INSERT ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.set_numero_pedido();

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Policy: leitura pública (cliente consulta o próprio pedido por número)
CREATE POLICY "pedidos_select_public" ON public.pedidos
  FOR SELECT USING (true);

-- Policy: inserção pública (qualquer pessoa pode fazer um pedido)
CREATE POLICY "pedidos_insert_public" ON public.pedidos
  FOR INSERT WITH CHECK (true);

-- Policy: atualização pública (envio de comprovante pelo cliente)
CREATE POLICY "pedidos_update_public" ON public.pedidos
  FOR UPDATE USING (true);

-- Policy: exclusão apenas para admin/moderador autenticado
CREATE POLICY "pedidos_delete_admin" ON public.pedidos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderador')
    )
  );


-- ==========================
-- 4. GRANT DE PERMISSÕES
--    Obrigatório para tabelas criadas via SQL
--    (dashboard cria automático; SQL não cria)
-- ==========================

-- profiles: authenticated pode ler o próprio perfil e inserir
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- pedidos: anon pode criar pedido e enviar comprovante; authenticated tem acesso total
GRANT SELECT, INSERT, UPDATE ON public.pedidos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;

-- sequência do numeroPedido
GRANT USAGE ON SEQUENCE public.pedidos_numero_seq TO anon, authenticated;


-- ==========================
-- 5. STORAGE: bucket comprovantes
-- ==========================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comprovantes',
  'comprovantes',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: upload público (clientes enviam sem login)
CREATE POLICY "comprovantes_insert_public" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'comprovantes');

-- Policy: leitura para usuário autenticado (admin vê via URL assinada)
CREATE POLICY "comprovantes_select_auth" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'comprovantes'
    AND auth.role() = 'authenticated'
  );

-- Policy: exclusão para admin/moderador
CREATE POLICY "comprovantes_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'comprovantes'
    AND auth.role() = 'authenticated'
  );


-- ==========================
-- 5. CRIAR USUÁRIO ADMIN
--    Execute APÓS criar o usuário em Authentication > Users
--    Substitua o UUID pelo ID real do usuário criado
-- ==========================

-- UPDATE public.profiles
--   SET role = 'admin', nome = 'Admin UMADGOV'
--   WHERE id = 'COLE-AQUI-O-UUID-DO-USUARIO';
