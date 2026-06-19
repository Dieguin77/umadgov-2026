import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { STATUS, STATUS_LABELS, FORMA_PAGAMENTO_LABELS } from '@/data/mockOrders'

export default function SearchBar({ onSearch, onStatusFilter, onPaymentFilter }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [payment, setPayment] = useState('')

  const handleSearch = (val) => {
    setSearch(val)
    onSearch(val)
  }

  const handleStatus = (val) => {
    setStatus(val)
    onStatusFilter(val)
  }

  const handlePayment = (val) => {
    setPayment(val)
    onPaymentFilter?.(val)
  }

  const clear = () => {
    setSearch('')
    setStatus('')
    setPayment('')
    onSearch('')
    onStatusFilter('')
    onPaymentFilter?.('')
  }

  const hasFilters = search || status || payment

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[180px]">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavanda-400" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nome, pedido, congregação..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-lavanda-200 focus:border-lavanda-500 focus:outline-none focus:ring-2 focus:ring-lavanda-100 text-sm transition-all"
        />
      </div>

      <select
        value={status}
        onChange={(e) => handleStatus(e.target.value)}
        className="px-4 py-2.5 rounded-xl border-2 border-lavanda-200 focus:border-lavanda-500 focus:outline-none text-sm transition-all appearance-none cursor-pointer bg-white"
      >
        <option value="">Todos os status</option>
        {Object.entries(STATUS_LABELS).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>

      <select
        value={payment}
        onChange={(e) => handlePayment(e.target.value)}
        className="px-4 py-2.5 rounded-xl border-2 border-lavanda-200 focus:border-lavanda-500 focus:outline-none text-sm transition-all appearance-none cursor-pointer bg-white"
      >
        <option value="">Todas as formas</option>
        {Object.entries(FORMA_PAGAMENTO_LABELS).map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clear}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm transition-colors"
        >
          <X size={14} />
          Limpar
        </button>
      )}
    </div>
  )
}
