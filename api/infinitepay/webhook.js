import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

// A InfinitePay não assina o payload do webhook (não há header de
// autenticidade documentado). Por isso este handler NUNCA aprova um pedido
// só com base no que chegou aqui — ele sempre revalida chamando
// payment_check de volta na InfinitePay com os mesmos identificadores antes
// de marcar o pedido como pago. Um payload forjado com um transaction_nsu
// inventado simplesmente não será confirmado como pago nessa revalidação.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  const handle = process.env.INFINITEPAY_HANDLE
  if (!supabaseUrl || !supabaseAnonKey || !handle) {
    console.error('InfinitePay webhook: variáveis de ambiente ausentes')
    return res.status(500).end()
  }

  const payload = req.body || {}
  const orderNsu = payload.order_nsu
  const transactionNsu = payload.transaction_nsu
  const slug = payload.invoice_slug || payload.slug

  if (!orderNsu || !transactionNsu || !slug) {
    console.error('Webhook InfinitePay com payload incompleto:', payload)
    return res.status(400).json({ error: 'Payload incompleto' })
  }

  let checkRes
  try {
    checkRes = await fetch('https://api.checkout.infinitepay.io/payment_check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle, order_nsu: orderNsu, transaction_nsu: transactionNsu, slug }),
    })
  } catch (err) {
    console.error('Falha de rede ao revalidar pagamento na InfinitePay:', err)
    return res.status(400).json({ error: 'Não foi possível confirmar o pagamento' })
  }

  if (!checkRes.ok) {
    console.error('payment_check retornou erro:', checkRes.status)
    return res.status(400).json({ error: 'Não foi possível confirmar o pagamento' })
  }

  const check = await checkRes.json().catch(() => null)
  if (!check?.paid) {
    console.warn('Webhook recebido, mas payment_check não confirma pagamento para', orderNsu)
    return res.status(400).json({ error: 'Pagamento não confirmado' })
  }

  const valorPagoCentavos = check.paid_amount ?? payload.paid_amount ?? 0
  const valorPago = Number(valorPagoCentavos) / 100

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { error } = await supabase.rpc('mark_pedido_pago_infinitepay', {
    p_numero_pedido: orderNsu,
    p_transaction_nsu: transactionNsu,
    p_valor_pago: valorPago,
    p_forma_pagamento: 'cartao',
  })

  if (error) {
    console.error('Erro ao aprovar pedido via InfinitePay:', error)
    return res.status(500).json({ error: 'Erro interno' })
  }

  return res.status(200).json({ ok: true })
}
