import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Edit, Trash2, ChevronUp, ChevronDown, FileText } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import OrderDetailModal from './OrderDetailModal'
import EditOrderModal from './EditOrderModal'

export default function OrdersTable({ orders, loading, onUpdateStatus, onUpdateOrder, onDeleteOrder }) {
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...orders].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey]
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })

  const SortIcon = ({ col }) => (
    sortKey === col
      ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)
      : <ChevronDown size={14} className="opacity-30" />
  )

  const ThSort = ({ col, children }) => (
    <th
      className="text-left px-4 py-3 text-xs font-bold text-lavanda-500 uppercase tracking-wider cursor-pointer hover:text-lavanda-700 select-none"
      onClick={() => toggleSort(col)}
    >
      <span className="flex items-center gap-1">{children}<SortIcon col={col} /></span>
    </th>
  )

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-lavanda-100 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 border-b border-lavanda-50 animate-pulse bg-lavanda-50/50" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-lavanda-100 p-16 text-center">
        <FileText size={40} className="text-lavanda-200 mx-auto mb-3" />
        <p className="text-lavanda-500 font-semibold">Nenhum pedido encontrado</p>
        <p className="text-lavanda-400 text-sm mt-1">Tente ajustar os filtros de busca</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-lavanda-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-lavanda-50 border-b border-lavanda-100">
              <tr>
                <ThSort col="numeroPedido">Pedido</ThSort>
                <ThSort col="nome">Nome</ThSort>
                <th className="text-left px-4 py-3 text-xs font-bold text-lavanda-500 uppercase tracking-wider hidden md:table-cell">Congregação</th>
                <ThSort col="tamanho">Tam.</ThSort>
                <ThSort col="quantidade">Qtd</ThSort>
                <ThSort col="valor">Valor</ThSort>
                <ThSort col="status">Status</ThSort>
                <th className="text-left px-4 py-3 text-xs font-bold text-lavanda-500 uppercase tracking-wider hidden lg:table-cell">Data</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-lavanda-50">
              <AnimatePresence initial={false}>
                {sorted.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-lavanda-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-lavanda-700 bg-lavanda-100 px-2 py-1 rounded-lg">
                        {order.numeroPedido}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-lavanda-800 text-sm">{order.nome}</p>
                      <p className="text-lavanda-400 text-xs">{order.telefone}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-lavanda-600 text-sm">{order.congregacao}</td>
                    <td className="px-4 py-3">
                      <span className="bg-lavanda-100 text-lavanda-700 font-bold text-sm px-2 py-1 rounded-lg">{order.tamanho}</span>
                    </td>
                    <td className="px-4 py-3 text-lavanda-700 font-semibold text-sm text-center">{order.quantidade}</td>
                    <td className="px-4 py-3 text-dourado-600 font-black text-sm">{formatCurrency(order.valor)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 hidden lg:table-cell text-lavanda-400 text-xs">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelected(order)}
                          className="p-1.5 rounded-lg hover:bg-lavanda-100 text-lavanda-500 hover:text-lavanda-700 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditing(order)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-lavanda-400 hover:text-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(order)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-lavanda-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-lavanda-50 text-lavanda-400 text-xs">
          {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <OrderDetailModal
          order={selected}
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={onUpdateStatus}
        />
      )}

      {/* Edit Modal */}
      {editing && (
        <EditOrderModal
          order={editing}
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          onSave={onUpdateOrder}
        />
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <h3 className="font-black text-lavanda-900 text-lg mb-2">Excluir pedido?</h3>
            <p className="text-lavanda-500 text-sm mb-1">Esta ação não pode ser desfeita.</p>
            <p className="text-lavanda-700 font-semibold mb-6">{confirmDelete.numeroPedido} — {confirmDelete.nome}</p>
            <div className="flex gap-3">
              <button
                onClick={async () => { await onDeleteOrder(confirmDelete.id); setConfirmDelete(null) }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors"
              >
                Excluir
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-lavanda-200 text-lavanda-600 font-semibold py-2.5 rounded-xl hover:bg-lavanda-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
