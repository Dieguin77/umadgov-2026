import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, Package, CheckCircle, Clock, Truck, Star } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { STATUS, STATUS_LABELS, STATUS_COLORS } from '@/data/mockOrders'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import Button from '@/components/ui/Button'

const statusSteps = [
  { key: STATUS.AGUARDANDO_PAGAMENTO, icon: Clock, label: 'Aguardando Pagamento' },
  { key: STATUS.COMPROVANTE_ENVIADO, icon: Package, label: 'Comprovante Enviado' },
  { key: STATUS.PAGAMENTO_APROVADO, icon: CheckCircle, label: 'Pagamento Aprovado' },
  { key: STATUS.SEPARADO_RETIRADA, icon: Truck, label: 'Separado para Retirada' },
  { key: STATUS.ENTREGUE, icon: Star, label: 'Entregue' },
]

function StatusTimeline({ currentStatus }) {
  const currentIdx = statusSteps.findIndex(s => s.key === currentStatus)

  return (
    <div className="space-y-0">
      {statusSteps.map((step, i) => {
        const isDone = i <= currentIdx
        const isCurrent = i === currentIdx
        const Icon = step.icon

        return (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`
                w-9 h-9 rounded-full flex items-center justify-center shrink-0
                ${isDone ? 'bg-lavanda-600 text-white' : 'bg-lavanda-100 text-lavanda-300'}
                ${isCurrent ? 'ring-4 ring-lavanda-200' : ''}
              `}>
                <Icon size={16} />
              </div>
              {i < statusSteps.length - 1 && (
                <div className={`w-0.5 h-8 mt-1 ${isDone && i < currentIdx ? 'bg-lavanda-600' : 'bg-lavanda-100'}`} />
              )}
            </div>
            <div className={`pb-4 ${i === statusSteps.length - 1 ? 'pb-0' : ''}`}>
              <p className={`font-semibold text-sm pt-1.5 ${isDone ? 'text-lavanda-800' : 'text-lavanda-300'}`}>
                {step.label}
                {isCurrent && (
                  <span className="ml-2 text-xs bg-lavanda-100 text-lavanda-600 px-2 py-0.5 rounded-full">Atual</span>
                )}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function OrderStatusPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('pedido') || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const fetchOrder = async (num) => {
    if (!num) return
    setLoading(true)
    setNotFound(false)
    setOrder(null)
    try {
      const data = await orderService.getOrderByNumber(num.toUpperCase().trim())
      if (!data) setNotFound(true)
      else setOrder(data)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const pedido = params.get('pedido')
    if (pedido) { setSearch(pedido); fetchOrder(pedido) }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setParams({ pedido: search })
    fetchOrder(search)
  }

  return (
    <div className="min-h-screen bg-lavanda-50 pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-lavanda-500 hover:text-lavanda-700 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar ao início
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-lavanda-100"
        >
          {/* Header */}
          <div className="bg-gradient-hero p-6 text-white text-center rounded-t-2xl">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Search size={24} />
            </div>
            <h1 className="text-xl font-black">Consultar Pedido</h1>
            <p className="text-lavanda-200 text-sm mt-1">Acompanhe o status do seu pedido</p>
          </div>

          <div className="p-6">
            {/* Search form */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-6">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Ex: UMD-2026-0001"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-lavanda-200 focus:border-lavanda-500 focus:outline-none focus:ring-2 focus:ring-lavanda-100 font-mono transition-all uppercase"
              />
              <Button type="submit" loading={loading} icon={Search}>Buscar</Button>
            </form>

            {/* Not found */}
            {notFound && !loading && (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-lavanda-700">Pedido não encontrado</p>
                <p className="text-lavanda-400 text-sm mt-1">Verifique o número e tente novamente</p>
              </div>
            )}

            {/* Order found */}
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Order header */}
                <div className="bg-lavanda-50 rounded-xl p-4 flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="text-xs text-lavanda-400">Número do pedido</p>
                    <p className="font-black text-lavanda-800 text-lg font-mono">{order.numeroPedido}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-lavanda-400">Status</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                {/* Order details */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { l: 'Nome', v: order.nome },
                    { l: 'Tamanho', v: order.tamanho },
                    { l: 'Quantidade', v: `${order.quantidade}x` },
                    { l: 'Valor', v: formatCurrency(order.valor) },
                    { l: 'Congregação', v: order.congregacao },
                    { l: 'Data', v: formatDateTime(order.createdAt) },
                  ].map(item => (
                    <div key={item.l} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-lavanda-400 mb-0.5">{item.l}</p>
                      <p className="text-lavanda-800 font-semibold text-sm">{item.v}</p>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div>
                  <p className="text-sm font-bold text-lavanda-800 mb-4">Acompanhamento</p>
                  <StatusTimeline currentStatus={order.status} />
                </div>

                {/* CTA: send receipt if waiting */}
                {order.status === STATUS.AGUARDANDO_PAGAMENTO && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-700 text-sm font-semibold mb-2">Pagamento pendente</p>
                    <p className="text-amber-600 text-sm mb-3">
                      Realize o Pix e envie o comprovante para agilizar a aprovação.
                    </p>
                    <Link
                      to={`/enviar-comprovante?pedido=${order.numeroPedido}`}
                      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Enviar comprovante
                    </Link>
                  </div>
                )}

                {order.status === STATUS.ENTREGUE && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-2xl mb-2">🎉</p>
                    <p className="text-green-700 font-bold">Camisa entregue!</p>
                    <p className="text-green-600 text-sm">Que Deus abençoe esta geração eleita!</p>
                  </div>
                )}
              </motion.div>
            )}

            {!order && !notFound && !loading && (
              <div className="text-center py-6 text-lavanda-400 text-sm">
                Digite o número do pedido para consultar
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
