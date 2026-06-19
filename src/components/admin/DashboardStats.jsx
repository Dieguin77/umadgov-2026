import { motion } from 'framer-motion'
import { ShoppingBag, Package, Clock, CheckCircle, FileCheck, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

function StatCard({ icon: Icon, title, value, color, bgLight, delay, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl p-5 border border-lavanda-100 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-black text-lavanda-900 mb-0.5">{value}</p>
      <p className="text-lavanda-500 text-sm font-medium leading-tight">{title}</p>
      {sub && <p className="text-lavanda-400 text-xs mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function DashboardStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-lavanda-100 animate-pulse h-32" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
        delay={0.06}
      />
      <StatCard
        icon={Clock}
        title="Aguardando pagamento"
        value={stats.aguardandoPagamento}
        color="bg-amber-500"
        delay={0.12}
      />
      <StatCard
        icon={FileCheck}
        title="Comprovantes enviados"
        value={stats.comprovantesEnviados}
        color="bg-blue-500"
        delay={0.18}
      />
      <StatCard
        icon={CheckCircle}
        title="Pagamentos aprovados"
        value={stats.aprovados}
        color="bg-emerald-500"
        delay={0.24}
      />
      <StatCard
        icon={TrendingUp}
        title="Receita total"
        value={formatCurrency(stats.receitaTotal)}
        color="bg-violet-600"
        delay={0.3}
      />
    </div>
  )
}
