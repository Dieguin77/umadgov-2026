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

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
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
  "shirtModel"     TEXT NOT NULL DEFAULT 'masculino'
                     CHECK ("shirtModel" IN ('masculino', 'baby_look', 'infantil')),
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
                     CHECK ("formaPagamento" IN ('pix')),
  comprovante      TEXT,
  "comprovanteAt"  TIMESTAMPTZ,
  observacoes      TEXT,
  "createdAt"      TIMESTAMPTZ DEFAULT NOW()
);

-- Migração idempotente: adiciona a coluna em bancos já existentes
-- (necessário rodar manualmente no SQL Editor do Supabase, já que este
-- script não cria a tabela de novo se ela já existir).
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS "shirtModel" TEXT NOT NULL DEFAULT 'masculino';

ALTER TABLE public.pedidos
  DROP CONSTRAINT IF EXISTS pedidos_shirtmodel_check;
ALTER TABLE public.pedidos
  ADD CONSTRAINT pedidos_shirtmodel_check
  CHECK ("shirtModel" IN ('masculino', 'baby_look', 'infantil'));

-- Trigger: atribui numeroPedido automaticamente ao inserir
DROP TRIGGER IF EXISTS trg_set_numero_pedido ON public.pedidos;
CREATE TRIGGER trg_set_numero_pedido
  BEFORE INSERT ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.set_numero_pedido();

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Policy: leitura restrita a admin/moderador autenticado. O cliente final
-- NÃO lê a tabela diretamente (isso permitiria, via chave anon, baixar todos
-- os pedidos de todo mundo com uma query sem filtro). A consulta pública de
-- UM pedido pelo número acontece pela função get_pedido_by_numero() abaixo.
DROP POLICY IF EXISTS "pedidos_select_public" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos_select_admin" ON public.pedidos;
CREATE POLICY "pedidos_select_admin" ON public.pedidos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderador')
    )
  );

-- Nao ha policy de INSERT publica: um INSERT do PostgREST sempre volta com
-- RETURNING *, que aciona a policy de SELECT acima (restrita a
-- admin/moderador) — ou seja, mesmo com INSERT liberado, o cliente final
-- nunca conseguiria ler de volta o pedido que acabou de criar (precisa do
-- numeroPedido gerado pelo trigger). A criacao de pedido do cliente final
-- passa pela funcao create_pedido() abaixo (SECURITY DEFINER), que insere e
-- devolve a linha sem depender de RLS.
DROP POLICY IF EXISTS "pedidos_insert_public" ON public.pedidos;

-- Policy: atualização restrita a admin/moderador autenticado. O envio de
-- comprovante pelo cliente final passa pela função
-- update_comprovante_by_numero() abaixo (SECURITY DEFINER), que só altera os
-- campos de comprovante do próprio pedido — nunca a tabela inteira.
DROP POLICY IF EXISTS "pedidos_update_public" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos_update_admin" ON public.pedidos;
CREATE POLICY "pedidos_update_admin" ON public.pedidos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderador')
    )
  );

-- Policy: exclusão apenas para admin/moderador autenticado
DROP POLICY IF EXISTS "pedidos_delete_admin" ON public.pedidos;
CREATE POLICY "pedidos_delete_admin" ON public.pedidos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderador')
    )
  );


-- ==========================
-- 3b. FUNÇÕES PÚBLICAS (SECURITY DEFINER)
--    Substituem o antigo acesso direto (SELECT/UPDATE) da chave anon à
--    tabela inteira: expõem só a operação pontual que o cliente final
--    precisa — consultar o PRÓPRIO pedido pelo número, ou enviar o
--    comprovante do PRÓPRIO pedido — sem permitir leitura/gravação de
--    pedidos de outras pessoas.
-- ==========================

CREATE OR REPLACE FUNCTION public.create_pedido(
  p_nome TEXT,
  p_telefone TEXT,
  p_congregacao TEXT,
  p_shirt_model TEXT,
  p_tamanho TEXT,
  p_quantidade INTEGER,
  p_valor NUMERIC,
  p_forma_pagamento TEXT,
  p_observacoes TEXT DEFAULT NULL
)
RETURNS SETOF public.pedidos
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.pedidos (
    nome, telefone, congregacao, "shirtModel", tamanho, quantidade, valor,
    status, "formaPagamento", comprovante, "comprovanteAt", observacoes
  )
  VALUES (
    p_nome, p_telefone, p_congregacao, p_shirt_model, p_tamanho, p_quantidade, p_valor,
    'aguardando_pagamento', p_forma_pagamento, NULL, NULL, p_observacoes
  )
  RETURNING *;
$$;

REVOKE ALL ON FUNCTION public.create_pedido(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, NUMERIC, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_pedido(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, NUMERIC, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_pedido_by_numero(p_numero TEXT)
RETURNS SETOF public.pedidos
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.pedidos WHERE "numeroPedido" = p_numero;
$$;

REVOKE ALL ON FUNCTION public.get_pedido_by_numero(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_pedido_by_numero(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_comprovante_by_numero(p_numero TEXT, p_comprovante TEXT)
RETURNS SETOF public.pedidos
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.pedidos
  SET comprovante = p_comprovante,
      "comprovanteAt" = NOW(),
      status = 'comprovante_enviado'
  WHERE "numeroPedido" = p_numero
  RETURNING *;
$$;

REVOKE ALL ON FUNCTION public.update_comprovante_by_numero(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_comprovante_by_numero(TEXT, TEXT) TO anon, authenticated;


-- ==========================
-- 4. GRANT DE PERMISSÕES
--    Obrigatório para tabelas criadas via SQL
--    (dashboard cria automático; SQL não cria)
-- ==========================

-- profiles: authenticated pode ler o próprio perfil e inserir. anon nao
-- precisa de nenhum grant aqui: as tres operacoes publicas (criar pedido,
-- consultar, enviar comprovante) passam por funcoes SECURITY DEFINER que
-- ignoram a RLS de pedidos inteiramente, entao nunca chegam a avaliar o
-- EXISTS contra profiles das policies pedidos_select_admin/pedidos_update_admin.
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- pedidos: anon nao tem NENHUM grant direto na tabela — criar pedido,
-- consultar e enviar comprovante passam inteiramente pelas funções
-- SECURITY DEFINER acima (create_pedido, get_pedido_by_numero,
-- update_comprovante_by_numero), que ignoram RLS e nao dependem de GRANT de
-- tabela para o caller. authenticated (admin/moderador) tem acesso total via
-- policy.
REVOKE SELECT, INSERT, UPDATE ON public.pedidos FROM anon;
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
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Migração idempotente: alguns navegadores/dispositivos (ex.: fotos
-- encaminhadas pelo WhatsApp no Android) reportam o MIME type de JPEG
-- como "image/jpg" (não-padrão) em vez de "image/jpeg". O front-end já
-- aceita os dois, mas o bucket precisa aceitar também, senão o upload
-- é rejeitado silenciosamente do ponto de vista do usuário.
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
WHERE id = 'comprovantes';

-- Policy: upload público (clientes enviam sem login)
DROP POLICY IF EXISTS "comprovantes_insert_public" ON storage.objects;
CREATE POLICY "comprovantes_insert_public" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'comprovantes');

-- Policy: upsert público (o app usa upsert:true no upload; sem esta
-- policy, uma segunda gravação no mesmo caminho — ex.: retry de rede
-- instável ou duplo toque no mobile — vira um UPDATE bloqueado por RLS
-- com o erro "new row violates row-level security policy")
DROP POLICY IF EXISTS "comprovantes_update_public" ON storage.objects;
CREATE POLICY "comprovantes_update_public" ON storage.objects
  FOR UPDATE USING (bucket_id = 'comprovantes')
  WITH CHECK (bucket_id = 'comprovantes');

-- Policy: leitura para usuário autenticado (admin vê via URL assinada)
DROP POLICY IF EXISTS "comprovantes_select_auth" ON storage.objects;
CREATE POLICY "comprovantes_select_auth" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'comprovantes'
    AND auth.role() = 'authenticated'
  );

-- Policy: exclusão para admin/moderador
DROP POLICY IF EXISTS "comprovantes_delete_admin" ON storage.objects;
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
