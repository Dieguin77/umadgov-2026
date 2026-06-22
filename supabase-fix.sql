-- ============================================================
-- UMADGOV 2026 — Script de Correção do Login Admin
-- Execute no SQL Editor do Supabase (project > SQL Editor)
-- Execute PASSO A PASSO, um bloco por vez
-- ============================================================


-- ============================================================
-- PASSO 1: DIAGNÓSTICO
-- Execute estes dois SELECT e compare os UUIDs
-- ============================================================

-- Mostra o UUID REAL do usuário em auth.users
SELECT
  id   AS "uuid_em_auth_users",
  email,
  created_at
FROM auth.users
WHERE email = 'vinicius.dias148@gmail.com';

-- Mostra o que existe na tabela profiles
SELECT
  id   AS "uuid_em_profiles",
  nome,
  role,
  "createdAt"
FROM public.profiles;

-- Se os UUIDs dos dois SELECT acima forem DIFERENTES,
-- o problema está confirmado: UUID mismatch.
-- Prossiga para o PASSO 2.
--
-- Se forem IGUAIS, o problema é apenas a política RLS.
-- Pule para o PASSO 3.


-- ============================================================
-- PASSO 2: CORRIGIR O UUID DO PROFILE
-- (execute apenas se os UUIDs do PASSO 1 forem diferentes)
-- ============================================================

-- Remove o profile com UUID incorreto
DELETE FROM public.profiles
WHERE id = '2dd8a0a8-d1ad-4c9e-aa8a-fbc737ae3f44';

-- Cria o profile com o UUID correto (buscado diretamente de auth.users)
INSERT INTO public.profiles (id, nome, role)
SELECT
  id,
  'Admin UMADGOV',
  'admin'
FROM auth.users
WHERE email = 'vinicius.dias148@gmail.com'
ON CONFLICT (id) DO UPDATE
  SET nome = 'Admin UMADGOV',
      role = 'admin';

-- Confirme que agora os UUIDs batem:
SELECT
  u.id  AS "uuid_auth_users",
  p.id  AS "uuid_profiles",
  p.nome,
  p.role,
  CASE WHEN u.id = p.id THEN '✓ CORRETO' ELSE '✗ AINDA DIFERENTE' END AS status
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'vinicius.dias148@gmail.com';


-- ============================================================
-- PASSO 3: CORRIGIR POLÍTICAS RLS DA TABELA profiles
-- ============================================================

-- Remove policies antigas (se existirem)
DROP POLICY IF EXISTS "profiles_select_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_auth"  ON public.profiles;

-- Policy SELECT: usuário autenticado lê apenas o próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy INSERT: usuário autenticado insere apenas o próprio perfil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Garante que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- PASSO 4: VERIFICAÇÃO FINAL
-- ============================================================

-- Confirma o estado final
SELECT
  schemaname,
  tablename,
  rowsecurity AS "rls_habilitado"
FROM pg_tables
WHERE tablename = 'profiles';

SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

SELECT id, nome, role FROM public.profiles;
