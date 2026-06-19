import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/layouts/AdminLayout'
import AdminLogin from '@/components/admin/AdminLogin'
import DashboardStats from '@/components/admin/DashboardStats'
import OrdersTable from '@/components/admin/OrdersTable'
import SearchBar from '@/components/admin/SearchBar'
import { useAdmin } from '@/context/AdminContext'
import { useOrders, useDashboardStats } from '@/hooks/useOrders'

export default function AdminPage() {
  const { isAuthenticated, loading: authLoading } = useAdmin()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filters = { search: search || undefined, status: statusFilter || undefined }
  const { orders, loading, updateStatus, updateOrder, deleteOrder } = useOrders(filters)
  const { stats, loading: statsLoading } = useDashboardStats()

  const handleSearch = useCallback((val) => setSearch(val), [])
  const handleStatusFilter = useCallback((val) => setStatusFilter(val), [])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-lavanda-200 border-t-lavanda-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin />
  }

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

          <SearchBar onSearch={handleSearch} onStatusFilter={handleStatusFilter} />

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
