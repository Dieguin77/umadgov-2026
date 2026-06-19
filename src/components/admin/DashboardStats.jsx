import { motion } from 'framer-motion'
import { ShoppingBag, Package, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

function StatCard({ icon: Icon, title, value, color, delay, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl p-6 border border-lavanda-100 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-black text-lavanda-900 mb-1">{value}</p>
      <p className="text-lavanda-500 text-sm font-medium">{title}</p>
      {sub && <p className="text-lavanda-400 text-xs mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function DashboardStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-lavanda-100 animate-pulse h-36" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={ShoppingBag}
        title="Total de pedidos"
        value={stats.total}
        color="bg-lavanda-600"
        delay={0}
      />
      <StatCard
        icon={Package}
        title="Camisas vendidas"
        value={stats.totalVendido}
        color="bg-dourado-500"
        delay={0.08}
        sub={`${formatCurrency(stats.receitaTotal)} em receita`}
      />
      <StatCard
        icon={Clock}
        title="Pendentes"
        value={stats.pendentes}
        color="bg-amber-500"
        delay={0.16}
        sub="Aguardando ou comprovante"
      />
      <StatCard
        icon={CheckCircle}
        title="Aprovados"
        value={stats.aprovados}
        color="bg-green-500"
        delay={0.24}
        sub="Aprovados, separados ou entregues"
      />
    </div>
  )
}
