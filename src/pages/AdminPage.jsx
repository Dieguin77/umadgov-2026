import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/layouts/AdminLayout'
import DashboardStats from '@/components/admin/DashboardStats'
import OrdersTable from '@/components/admin/OrdersTable'
import SearchBar from '@/components/admin/SearchBar'
import { useOrders, useDashboardStats } from '@/hooks/useOrders'

export default function AdminPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')

  const filters = {
    search: search || undefined,
    status: statusFilter || undefined,
    formaPagamento: paymentFilter || undefined,
  }
  const { orders, loading, updateStatus, updateOrder, deleteOrder } = useOrders(filters)
  const { stats, loading: statsLoading } = useDashboardStats()

  const handleSearch = useCallback((val) => setSearch(val), [])
  const handleStatusFilter = useCallback((val) => setStatusFilter(val), [])
  const handlePaymentFilter = useCallback((val) => setPaymentFilter(val), [])

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black text-lavanda-900">Dashboard</h1>
          <p className="text-lavanda-500 mt-1">UMADGOV 2026 — Gerenciamento de pedidos</p>
        </motion.div>

        {/* Stats */}
        <DashboardStats stats={stats} loading={statsLoading} />

        {/* Orders section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-lavanda-900">Pedidos</h2>
          </div>

          <SearchBar
            onSearch={handleSearch}
            onStatusFilter={handleStatusFilter}
            onPaymentFilter={handlePaymentFilter}
          />

          <OrdersTable
            orders={orders}
            loading={loading}
            onUpdateStatus={updateStatus}
            onUpdateOrder={updateOrder}
            onDeleteOrder={deleteOrder}
          />
        </motion.div>
      </div>
    </AdminLayout>
  )
}
