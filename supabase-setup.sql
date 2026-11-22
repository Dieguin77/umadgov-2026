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

-- Sem policy de INSERT/UPDATE: o site só LÊ o próprio perfil, e quem cria o
-- perfil é o trigger abaixo. Uma policy de escrita deixaria qualquer conta
-- gravar role = 'admin' no próprio perfil.
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Trigger: cria perfil automaticamente ao cadastrar um novo usuário.
-- O role NUNCA vem do cadastro (raw_user_meta_data é controlado por quem se
-- cadastra): fica no DEFAULT da coluna ('user'). Promover a admin/moderador
-- é sempre manual (ver o fim deste arquivo).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

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
                     CHECK ("formaPagamento" IN ('pix', 'cartao')),
  comprovante      TEXT,
  "comprovanteAt"  TIMESTAMPTZ,
  observacoes      TEXT,
  "transacaoId"    TEXT,
  "valorPago"      NUMERIC(10,2),
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

-- Migração idempotente: colunas usadas pelo pagamento por cartão
-- (InfinitePay) em bancos já existentes.
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS "transacaoId" TEXT;
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS "valorPago" NUMERIC(10,2);

-- Migração idempotente: libera 'cartao' na constraint de formaPagamento
-- (antes só aceitava 'pix'). Usa um bloco dinâmico em vez de
-- DROP CONSTRAINT IF EXISTS com nome fixo porque o nome gerado
-- automaticamente pelo Postgres para o CHECK original pode variar.
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
    WHERE rel.relname = 'pedidos'
      AND con.contype = 'c'
      AND att.attname = 'formaPagamento'
  LOOP
    EXECUTE format('ALTER TABLE public.pedidos DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.pedidos
  ADD CONSTRAINT pedidos_formapagamento_check
  CHECK ("formaPagamento" IN ('pix', 'cartao'));

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

-- Policy: atualização restrita a admin/moderador autenticado. O cliente
-- final não altera pedido nenhum (o comprovante vai pelo WhatsApp).
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
--    precisa — criar o pedido e acompanhar o status pelo número.
--    Atenção: o número do pedido é sequencial (UMD-2026-0001, 0002...),
--    então qualquer função pública que receba só o número precisa tratar
--    o número como público — nunca devolver telefone, congregação ou
--    nome completo, e nunca alterar o pedido.
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

-- Consulta pública (páginas /consulta e /enviar-comprovante): só o que o
-- cliente precisa para acompanhar o pedido. Sem telefone, congregação,
-- comprovante, observações nem nome completo (só o primeiro nome).
-- DROP + CREATE porque CREATE OR REPLACE não troca o tipo de retorno de
-- bancos que ainda têm a versão antiga (RETURNS SETOF pedidos).
DROP FUNCTION IF EXISTS public.get_pedido_by_numero(TEXT);

CREATE FUNCTION public.get_pedido_by_numero(p_numero TEXT)
RETURNS TABLE (
  "numeroPedido"   TEXT,
  status           TEXT,
  nome             TEXT,
  "shirtModel"     TEXT,
  tamanho          TEXT,
  quantidade       INTEGER,
  valor            NUMERIC,
  "formaPagamento" TEXT,
  "createdAt"      TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p."numeroPedido",
    p.status,
    split_part(btrim(p.nome), ' ', 1),  -- só o primeiro nome
    p."shirtModel",
    p.tamanho,
    p.quantidade,
    p.valor,
    p."formaPagamento",
    p."createdAt"
  FROM public.pedidos p
  WHERE p."numeroPedido" = p_numero;
$$;

REVOKE ALL ON FUNCTION public.get_pedido_by_numero(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_pedido_by_numero(TEXT) TO anon, authenticated;

-- Envio de comprovante pelo site: DESLIGADO desde 20/09/2026 (o comprovante
-- vai pelo WhatsApp; ReceiptUpload não é usado em nenhuma página). A função
-- fica só para o código antigo, SEM grant para anon/authenticated: aberta,
-- ela deixava qualquer pessoa trocar o comprovante e voltar o status de
-- qualquer pedido pelo número, e devolvia a linha inteira. Para religar o
-- upload, crie uma versão que exija algo além do número (ex.: o telefone) e
-- devolva só o status.
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

REVOKE ALL ON FUNCTION public.update_comprovante_by_numero(TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- Ponto único de confirmação automática de pagamento por cartão
-- (InfinitePay). Chamada pela serverless function api/infinitepay/webhook.js
-- depois que ela já revalidou o pagamento direto na InfinitePay (payment_check)
-- — esta função nunca deve ser chamada só com base no payload do webhook.
-- Idempotente: o WHERE status = 'aguardando_pagamento' garante que uma
-- notificação repetida (a InfinitePay reenvia em caso de erro) não tem
-- efeito, e nunca retrocede um pedido que já avançou no fluxo (ex.: já
-- separado para retirada).
-- Só a service_role executa: o webhook usa SUPABASE_SERVICE_ROLE_KEY (env
-- da Vercel, nunca no front-end). Com grant para anon, qualquer pessoa
-- chamava /rest/v1/rpc/mark_pedido_pago_infinitepay direto e marcava
-- qualquer pedido como pago.
CREATE OR REPLACE FUNCTION public.mark_pedido_pago_infinitepay(
  p_numero_pedido TEXT,
  p_transaction_nsu TEXT,
  p_valor_pago NUMERIC,
  p_forma_pagamento TEXT DEFAULT 'cartao'
)
RETURNS SETOF public.pedidos
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.pedidos
  SET status = 'pagamento_aprovado',
      "formaPagamento" = p_forma_pagamento,
      "transacaoId" = p_transaction_nsu,
      "valorPago" = p_valor_pago
  WHERE "numeroPedido" = p_numero_pedido
    AND status = 'aguardando_pagamento'
  RETURNING *;
$$;

REVOKE ALL ON FUNCTION public.mark_pedido_pago_infinitepay(TEXT, TEXT, NUMERIC, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_pedido_pago_infinitepay(TEXT, TEXT, NUMERIC, TEXT) TO service_role;


-- ==========================
-- 4. GRANT DE PERMISSÕES
--    Obrigatório para tabelas criadas via SQL
--    (dashboard cria automático; SQL não cria)
-- ==========================

-- profiles: authenticated só LÊ o próprio perfil (policy profiles_select_own).
-- Sem INSERT/UPDATE: o perfil é criado pelo trigger handle_new_user, e
-- escrita pela API permitiria gravar role = 'admin'. anon nao precisa de
-- nenhum grant aqui: as operacoes publicas (criar pedido, consultar) passam
-- por funcoes SECURITY DEFINER que ignoram a RLS de pedidos inteiramente,
-- entao nunca chegam a avaliar o EXISTS contra profiles das policies
-- pedidos_select_admin/pedidos_update_admin.
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;

-- pedidos: anon nao tem NENHUM grant direto na tabela — criar pedido e
-- consultar passam inteiramente pelas funções SECURITY DEFINER acima
-- (create_pedido, get_pedido_by_numero), que ignoram RLS e nao dependem de
-- GRANT de tabela para o caller. authenticated (admin/moderador) tem acesso
-- total via policy.
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

-- Sem upload público: o envio de comprovante pelo site está desligado desde
-- 20/09/2026 (vai pelo WhatsApp). As policies antigas de INSERT/UPDATE
-- públicos deixavam qualquer pessoa gravar arquivos no bucket.
DROP POLICY IF EXISTS "comprovantes_insert_public" ON storage.objects;
DROP POLICY IF EXISTS "comprovantes_update_public" ON storage.objects;
DROP POLICY IF EXISTS "upload_comprovante" ON storage.objects;

-- Policy: leitura só para admin/moderador (admin vê via URL assinada).
-- Não basta estar logado: qualquer pessoa consegue criar uma conta.
DROP POLICY IF EXISTS "view_comprovante" ON storage.objects;
DROP POLICY IF EXISTS "comprovantes_select_auth" ON storage.objects;
DROP POLICY IF EXISTS "comprovantes_select_admin" ON storage.objects;
CREATE POLICY "comprovantes_select_admin" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'comprovantes'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderador')
    )
  );

-- Policy: exclusão só para admin/moderador
DROP POLICY IF EXISTS "comprovantes_delete_auth" ON storage.objects;
DROP POLICY IF EXISTS "comprovantes_delete_admin" ON storage.objects;
CREATE POLICY "comprovantes_delete_admin" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'comprovantes'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderador')
    )
  );


-- ==========================
-- 5. CRIAR USUÁRIO ADMIN
--    Execute APÓS criar o usuário em Authentication > Users
--    Substitua o UUID pelo ID real do usuário criado
-- ==========================

-- UPDATE public.profiles
--   SET role = 'admin', nome = 'Admin UMADGOV'
--   WHERE id = 'COLE-AQUI-O-UUID-DO-USUARIO';
