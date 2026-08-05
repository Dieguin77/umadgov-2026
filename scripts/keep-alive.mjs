#!/usr/bin/env node
// Mantém o projeto Supabase free ativo inserindo e limpando linhas em keep_alive.

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Erro: SUPABASE_URL e SUPABASE_ANON_KEY devem estar definidos.');
  process.exit(1);
}

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

const base = `${SUPABASE_URL}/rest/v1/keep_alive`;

// INSERT
const insertRes = await fetch(base, {
  method: 'POST',
  headers,
  body: JSON.stringify({ pinged_at: new Date().toISOString() }),
});

if (!insertRes.ok) {
  console.error('Falha no INSERT:', insertRes.status, await insertRes.text());
  process.exit(1);
}
const inserted = await insertRes.json();
console.log('keep-alive inserido:', inserted);

// DELETE linhas com mais de 30 dias
const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const deleteRes = await fetch(`${base}?pinged_at=lt.${cutoff}`, {
  method: 'DELETE',
  headers,
});

if (!deleteRes.ok) {
  console.error('Falha no DELETE:', deleteRes.status, await deleteRes.text());
  process.exit(1);
}
console.log(`Limpeza concluída: linhas anteriores a ${cutoff} removidas.`);
