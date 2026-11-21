-- ============================================================
-- UMADGOV 2026 — Correções de segurança (relato externo de 18/11/2026)
--
-- Rode INTEIRO no SQL Editor do Supabase. Pode rodar de novo sem problema.
--
-- ORDEM IMPORTANTE: rode só DEPOIS que o deploy na Vercel com as funções
-- /api atualizadas estiver no ar e a variável SUPABASE_SERVICE_ROLE_KEY
-- estiver configurada lá. A partir deste script, só o servidor (service_role)
-- consegue marcar pedido como pago.
--
-- O que muda:
--   1. Cadastro não escolhe mais o próprio papel (antes, signUp com
--      { role: 'admin' } criava um admin).
--   2. Consulta pública de pedido devolve só o necessário para acompanhar o
--      pedido (antes devolvia nome completo, telefone e congregação de
--      qualquer número UMD-2026-XXXX).
--   3. Envio de comprovante pelo site (desligado desde 20/09, hoje é pelo
--      WhatsApp) deixa de ser público.
--   4. Marcar pedido como pago passa a ser exclusivo do servidor.
--   5. Comprovantes no Storage: só admin/moderador lê ou apaga (antes,
--      qualquer conta criada no site lia todos).
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Perfis: o papel nunca vem do cadastro
-- ------------------------------------------------------------

-- O role fica no DEFAULT da coluna ('user'). Promover alguém a
-- admin/moderador é sempre manual, pelo SQL Editor.
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

-- O site só LÊ o próprio perfil (AdminLogin/AuthContext). Quem cria o
-- perfil é o trigger acima, então ninguém precisa inserir ou alterar
-- profiles pela API — senão daria para gravar role = 'admin' direto.
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon, authenticated;


-- ------------------------------------------------------------
-- 2. Consulta pública de pedido: sem telefone, congregação ou nome completo
-- ------------------------------------------------------------

-- DROP + CREATE porque o tipo de retorno muda (CREATE OR REPLACE não deixa).
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


-- ------------------------------------------------------------
-- 3 e 4. Funções que alteram pedido: fora do alcance da chave pública
-- ------------------------------------------------------------

DO $$
BEGIN
  -- Upload de comprovante pelo site está desligado (ReceiptUpload não é
  -- usado em nenhuma página). Aberta, a função deixava qualquer pessoa
  -- trocar o comprovante e voltar o status de qualquer pedido, e ainda
  -- devolvia a linha inteira (com telefone).
  IF to_regprocedure('public.update_comprovante_by_numero(text, text)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.update_comprovante_by_numero(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
  END IF;

  -- Só o webhook da InfinitePay (servidor, com a service_role key) marca
  -- pedido como pago, depois de revalidar o pagamento na InfinitePay.
  IF to_regprocedure('public.mark_pedido_pago_infinitepay(text, text, numeric, text)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.mark_pedido_pago_infinitepay(TEXT, TEXT, NUMERIC, TEXT) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.mark_pedido_pago_infinitepay(TEXT, TEXT, NUMERIC, TEXT) TO service_role;
  END IF;
END $$;


-- ------------------------------------------------------------
-- 5. Storage: bucket comprovantes
-- ------------------------------------------------------------

-- Upload/upsert público não é mais usado (comprovante vai pelo WhatsApp).
DROP POLICY IF EXISTS "comprovantes_insert_public" ON storage.objects;
DROP POLICY IF EXISTS "comprovantes_update_public" ON storage.objects;
DROP POLICY IF EXISTS "upload_comprovante" ON storage.objects;

-- Leitura e exclusão: antes bastava estar logado (qualquer conta criada no
-- site). Agora só admin/moderador, como na tabela pedidos.
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

COMMIT;

-- Faz a API (PostgREST) enxergar a nova assinatura de get_pedido_by_numero.
NOTIFY pgrst, 'reload schema';


-- ============================================================
-- CONFERÊNCIA (só leitura) — o resultado aparece embaixo do editor.
-- Procura sinais de que as falhas foram usadas:
--   * contas admin/moderador que você não reconhece;
--   * pedidos aprovados pelo caminho do webhook (os únicos com transacaoId):
--     compare cada um com as vendas no extrato da InfinitePay. Um que não
--     aparecer lá foi marcado como pago por alguém de fora.
-- ============================================================

SELECT 'admin/moderador' AS conferir,
       u.email AS detalhe,
       p.role AS info,
       u.created_at AS quando
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role IN ('admin', 'moderador')

UNION ALL

SELECT 'pago via InfinitePay (conferir no extrato)',
       pe."numeroPedido" || ' — NSU ' || pe."transacaoId",
       'forma ' || pe."formaPagamento" || ' · valor ' || pe.valor
         || ' · pago ' || COALESCE(pe."valorPago"::TEXT, 'nada'),
       pe."createdAt"
FROM public.pedidos pe
WHERE pe."transacaoId" IS NOT NULL

ORDER BY 1, 4;
