import { useState, useEffect, useCallback } from 'react'
import { orderService } from '@/services/orderService'
import toast from 'react-hot-toast'

export function useOrders(filters = {}) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await orderService.getAllOrders(filters)
      setOrders(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters.status, filters.search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateStatus = async (id, status) => {
    try {
      await orderService.updateOrderStatus(id, status)
      toast.success('Status atualizado com sucesso')
      await fetchOrders()
    } catch (err) {
      toast.error('Erro ao atualizar status: ' + err.message)
    }
  }

  const updateOrder = async (id, updates) => {
    try {
      await orderService.updateOrder(id, updates)
      toast.success('Pedido atualizado com sucesso')
      await fetchOrders()
    } catch (err) {
      toast.error('Erro ao atualizar pedido: ' + err.message)
    }
  }

  const deleteOrder = async (id) => {
    try {
      await orderService.deleteOrder(id)
      toast.success('Pedido excluído')
      await fetchOrders()
    } catch (err) {
      toast.error('Erro ao excluir pedido: ' + err.message)
    }
  }

  return { orders, loading, error, refetch: fetchOrders, updateStatus, updateOrder, deleteOrder }
}

export function useDashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  return { stats, loading }
}
