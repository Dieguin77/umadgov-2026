import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const handle = process.env.INFINITEPAY_HANDLE
  if (!supabaseUrl || !supabaseAnonKey || !handle) {
    console.error('InfinitePay: variáveis de ambiente ausentes (Supabase ou INFINITEPAY_HANDLE)')
    return res.status(500).json({ error: 'Pagamento por cartão indisponível no momento' })
  }

  const { numeroPedido } = req.body || {}
  if (!numeroPedido || typeof numeroPedido !== 'string') {
    return res.status(400).json({ error: 'numeroPedido é obrigatório' })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabase.rpc('get_pedido_by_numero', { p_numero: numeroPedido })
  if (error) {
    console.error('Erro ao buscar pedido para checkout InfinitePay:', error)
    return res.status(500).json({ error: 'Erro ao buscar pedido' })
  }

  const pedido = data?.[0]
  if (!pedido) {
    return res.status(404).json({ error: 'Pedido não encontrado' })
  }

  if (pedido.status !== 'aguardando_pagamento') {
    return res.status(409).json({ error: 'Este pedido não está aguardando pagamento' })
  }

  // O valor cobrado vem sempre do pedido já salvo no banco — nunca de um
  // valor recebido do navegador, o que impediria manipulação de preço.
  const priceInCents = Math.round(Number(pedido.valor) * 100)
  const origin = req.headers.origin || `https://${req.headers.host}`

  let infinitepayRes
  try {
    infinitepayRes = await fetch('https://api.checkout.infinitepay.io/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle,
        order_nsu: pedido.numeroPedido,
        redirect_url: `${origin}/consulta?pedido=${encodeURIComponent(pedido.numeroPedido)}`,
        webhook_url: `${origin}/api/infinitepay/webhook`,
        items: [
          {
            quantity: 1,
            price: priceInCents,
            description: `Camisa UMADGOV 2026 (${pedido.quantidade}x) — Pedido ${pedido.numeroPedido}`,
          },
        ],
        customer: {
          name: pedido.nome,
          phone_number: pedido.telefone,
        },
      }),
    })
  } catch (err) {
    console.error('Falha de rede ao chamar InfinitePay:', err)
    return res.status(502).json({ error: 'Não foi possível iniciar o pagamento. Tente novamente.' })
  }

  if (!infinitepayRes.ok) {
    const text = await infinitepayRes.text().catch(() => '')
    console.error('InfinitePay recusou a criação do link:', infinitepayRes.status, text)
    return res.status(502).json({ error: 'Não foi possível iniciar o pagamento. Tente novamente.' })
  }

  const linkData = await infinitepayRes.json().catch(() => null)
  const checkoutUrl = linkData?.url || linkData?.checkout_url || linkData?.link
  if (!checkoutUrl) {
    console.error('Resposta da InfinitePay sem URL de checkout:', linkData)
    return res.status(502).json({ error: 'Resposta inesperada do gateway de pagamento' })
  }

  return res.status(200).json({ checkoutUrl })
}
