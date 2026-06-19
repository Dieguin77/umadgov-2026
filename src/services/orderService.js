import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockOrders, STATUS } from '@/data/mockOrders'
import { generateOrderNumber } from '@/utils/orderNumber'
import { SHIRT_PRICE } from '@/data/mockOrders'

let localOrders = [...mockOrders]
let nextOrderIndex = mockOrders.length + 1

const getNextOrderNumber = () => {
  const num = nextOrderIndex++
  return generateOrderNumber(num)
}

export const orderService = {
  async createOrder(data) {
    const numeroPedido = getNextOrderNumber()
    const valor = data.quantidade * SHIRT_PRICE
    const newOrder = {
      ...data,
      numeroPedido,
      valor,
      status: STATUS.AGUARDANDO_PAGAMENTO,
      comprovante: null,
      createdAt: new Date().toISOString(),
    }

    if (isSupabaseConfigured) {
      const { data: created, error } = await supabase
        .from('pedidos')
        .insert([{ ...newOrder, id: undefined }])
        .select()
        .single()
      if (error) throw error
      return created
    }

    const order = { ...newOrder, id: `order_${Date.now()}_${Math.random().toString(36).slice(2,9)}` }
    localOrders.push(order)
    return order
  },

  async getOrderByNumber(numeroPedido) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('numeroPedido', numeroPedido)
        .single()
      if (error) throw error
      return data
    }
    return localOrders.find(o => o.numeroPedido === numeroPedido) || null
  },

  async getOrderById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    }
    return localOrders.find(o => o.id === id) || null
  },

  async getAllOrders(filters = {}) {
    if (isSupabaseConfigured) {
      let query = supabase.from('pedidos').select('*').order('createdAt', { ascending: false })
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.search) {
        query = query.or(
          `nome.ilike.%${filters.search}%,numeroPedido.ilike.%${filters.search}%,congregacao.ilike.%${filters.search}%`
        )
      }
      const { data, error } = await query
      if (error) throw error
      return data
    }

    let orders = [...localOrders].reverse()
    if (filters.status) orders = orders.filter(o => o.status === filters.status)
    if (filters.search) {
      const s = filters.search.toLowerCase()
      orders = orders.filter(o =>
        o.nome.toLowerCase().includes(s) ||
        o.numeroPedido.toLowerCase().includes(s) ||
        o.congregacao.toLowerCase().includes(s) ||
        o.telefone.includes(s)
      )
    }
    return orders
  },

  async updateOrderStatus(id, status) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('pedidos')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    }
    const idx = localOrders.findIndex(o => o.id === id)
    if (idx === -1) throw new Error('Pedido não encontrado')
    localOrders[idx] = { ...localOrders[idx], status }
    return localOrders[idx]
  },

  async updateOrder(id, updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('pedidos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    }
    const idx = localOrders.findIndex(o => o.id === id)
    if (idx === -1) throw new Error('Pedido não encontrado')
    localOrders[idx] = { ...localOrders[idx], ...updates }
    return localOrders[idx]
  },

  async deleteOrder(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('pedidos').delete().eq('id', id)
      if (error) throw error
      return true
    }
    const idx = localOrders.findIndex(o => o.id === id)
    if (idx === -1) throw new Error('Pedido não encontrado')
    localOrders.splice(idx, 1)
    return true
  },

  async updateComprovante(id, comprovantePath) {
    return this.updateOrder(id, {
      comprovante: comprovantePath,
      status: STATUS.COMPROVANTE_ENVIADO,
    })
  },

  async getDashboardStats() {
    const orders = await this.getAllOrders()
    const total = orders.length
    const totalVendido = orders.reduce((s, o) => s + o.quantidade, 0)
    const aguardandoPagamento = orders.filter(o => o.status === STATUS.AGUARDANDO_PAGAMENTO).length
    const comprovantesEnviados = orders.filter(o => o.comprovante !== null).length
    const aprovados = orders.filter(o =>
      o.status === STATUS.PAGAMENTO_APROVADO ||
      o.status === STATUS.SEPARADO_RETIRADA ||
      o.status === STATUS.ENTREGUE
    ).length
    const receitaTotal = orders.reduce((s, o) => s + o.valor, 0)
    return { total, totalVendido, aguardandoPagamento, comprovantesEnviados, aprovados, receitaTotal }
  },
}
