-- ================================================================
-- UMADGOV 2026 — Supabase Auth Setup
-- Execute este script no SQL Editor do painel Supabase:
-- https://app.supabase.com → seu projeto → SQL Editor
-- ================================================================


-- ================================================================
-- 1. TABELA DE PERFIS
-- ================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        UNIQUE NOT NULL,
  nome        TEXT        NOT NULL DEFAULT '',
  role        TEXT        NOT NULL DEFAULT 'viewer'
                          CHECK (role IN ('admin', 'moderador', 'viewer')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ================================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuário autenticado pode ler seu próprio perfil
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Cada usuário pode inserir apenas seu próprio perfil
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Cada usuário pode atualizar apenas seu próprio perfil
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);


-- ================================================================
-- 3. TRIGGER: criar perfil automaticamente quando usuário é criado
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    'viewer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Remove trigger anterior se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recria trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ================================================================
-- 4. STORAGE — BUCKET comprovantes
-- ================================================================

-- Criar o bucket via painel: Storage → New Bucket
--   Nome: comprovantes
--   Public: NÃO (privado)

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "upload_comprovante"          ON storage.objects;
DROP POLICY IF EXISTS "view_comprovante"            ON storage.objects;
DROP POLICY IF EXISTS "comprovantes_insert_public"  ON storage.objects;
DROP POLICY IF EXISTS "comprovantes_select_auth"    ON storage.objects;
DROP POLICY IF EXISTS "comprovantes_delete_auth"    ON storage.objects;

-- Qualquer pessoa pode fazer upload de comprovante (cliente)
CREATE POLICY "comprovantes_insert_public"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'comprovantes');

-- Apenas usuários autenticados (admins) podem visualizar comprovantes
CREATE POLICY "comprovantes_select_auth"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'comprovantes');

-- Apenas usuários autenticados (admins) podem excluir comprovantes
CREATE POLICY "comprovantes_delete_auth"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'comprovantes');


-- ================================================================
-- 5. CRIAR PRIMEIRO ADMINISTRADOR
-- ================================================================
--
-- PASSO 1: No painel Supabase → Authentication → Users → "Add user"
--   Email:  admin@umadgov.com   (ou o email que preferir)
--   Senha:  [escolha uma senha segura]
--
-- PASSO 2: Copie o UUID gerado para o usuário criado.
--
-- PASSO 3: Execute o SQL abaixo substituindo o UUID:
--
--   UPDATE profiles
--   SET role = 'admin', nome = 'Administrador UMADGOV'
--   WHERE email = 'admin@umadgov.com';
--
-- Se o perfil ainda não foi criado pelo trigger, use:
--
--   INSERT INTO profiles (id, email, nome, role)
--   VALUES (
--     'COLE_O_UUID_AQUI',
--     'admin@umadgov.com',
--     'Administrador UMADGOV',
--     'admin'
--   )
--   ON CONFLICT (id) DO UPDATE SET role = 'admin', nome = 'Administrador UMADGOV';


-- ================================================================
-- 6. CRIAR MODERADORES FUTURAMENTE
-- ================================================================
--
-- Para promover qualquer usuário a moderador:
--
--   UPDATE profiles
--   SET role = 'moderador'
--   WHERE email = 'outro@email.com';
--
-- Para revogar acesso (rebaixar para viewer):
--
--   UPDATE profiles
--   SET role = 'viewer'
--   WHERE email = 'usuario@email.com';
