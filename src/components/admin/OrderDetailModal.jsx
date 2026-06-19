import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { STATUS, STATUS_LABELS } from '@/data/mockOrders'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import { Eye, Check, Receipt } from 'lucide-react'
import ComprovanteModal from './ComprovanteModal'

export default function OrderDetailModal({ order, isOpen, onClose, onUpdateStatus }) {
  const [newStatus, setNewStatus] = useState(order?.status || '')
  const [saving, setSaving] = useState(false)
  const [showComprovante, setShowComprovante] = useState(false)

  if (!order) return null

  const handleSaveStatus = async () => {
    if (newStatus === order.status) return
    setSaving(true)
    await onUpdateStatus(order.id, newStatus)
    setSaving(false)
    onClose()
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Pedido ${order.numeroPedido}`} size="lg">
        <div className="space-y-5">
          {/* Status + date */}
          <div className="flex items-center justify-between p-4 bg-lavanda-50 rounded-xl">
            <div>
              <p className="text-xs text-lavanda-400 mb-1">Status atual</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="text-right">
              <p className="text-xs text-lavanda-400 mb-1">Data do pedido</p>
              <p className="text-lavanda-700 font-semibold text-sm">{formatDateTime(order.createdAt)}</p>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nome', value: order.nome },
              { label: 'Telefone', value: order.telefone },
              { label: 'Congregação', value: order.congregacao },
              { label: 'Tamanho', value: order.tamanho },
              { label: 'Quantidade', value: `${order.quantidade}x` },
              { label: 'Valor Total', value: formatCurrency(order.valor) },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-lavanda-400 mb-1">{item.label}</p>
                <p className="font-semibold text-lavanda-800 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Observations */}
          {order.observacoes && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-lavanda-400 mb-1">Observações</p>
              <p className="text-lavanda-700 text-sm">{order.observacoes}</p>
            </div>
          )}

          {/* Comprovante */}
          <div className="border border-lavanda-100 rounded-xl p-4">
            <p className="text-xs text-lavanda-400 uppercase tracking-wide mb-3 font-bold">Comprovante de Pagamento</p>
            {order.comprovante ? (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Receipt size={14} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-lavanda-700 text-sm font-semibold">Comprovante enviado</p>
                    {order.comprovanteAt && (
                      <p className="text-lavanda-400 text-xs">Em {formatDateTime(order.comprovanteAt)}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => setShowComprovante(true)}
                >
                  Visualizar
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-lavanda-400">
                <div className="w-8 h-8 bg-lavanda-50 rounded-lg flex items-center justify-center">
                  <Receipt size={14} className="text-lavanda-300" />
                </div>
                <p className="text-sm italic">Comprovante não enviado</p>
              </div>
            )}
          </div>

          {/* Change Status */}
          <div className="border-t border-lavanda-100 pt-5">
            <p className="text-sm font-semibold text-lavanda-800 mb-3">Alterar status</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setNewStatus(val)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                    newStatus === val
                      ? 'bg-lavanda-600 text-white border-lavanda-600'
                      : 'border-lavanda-200 text-lavanda-600 hover:border-lavanda-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="primary"
                icon={Check}
                loading={saving}
                disabled={newStatus === order.status}
                onClick={handleSaveStatus}
              >
                Salvar status
              </Button>
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            </div>
          </div>
        </div>
      </Modal>

      <ComprovanteModal
        order={order}
        isOpen={showComprovante}
        onClose={() => setShowComprovante(false)}
      />
    </>
  )
}
