import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react'
import PaymentInstructions from '@/components/order/PaymentInstructions'
import CardCheckoutRedirect from '@/components/order/CardCheckoutRedirect'
import ReceiptUpload from '@/components/order/ReceiptUpload'
import { orderService } from '@/services/orderService'
import { STATUS } from '@/data/mockOrders'

export default function PaymentPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const numeroPedido = params.get('pedido')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadDone, setUploadDone] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!numeroPedido) { setNotFound(true); setLoading(false); return }

    orderService.getOrderByNumber(numeroPedido)
      .then(data => {
        if (!data) setNotFound(true)
        else setOrder(data)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [numeroPedido])

  if (loading) {
    return (
      <div className="min-h-screen bg-lavanda-50 pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-lavanda-200 border-t-lavanda-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-lavanda-50 pt-24 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-2xl font-black text-lavanda-900 mb-2">Pedido não encontrado</h2>
          <p className="text-lavanda-500 mb-6">Verifique o número do pedido e tente novamente.</p>
          <Link to="/pedido" className="text-lavanda-600 font-semibold hover:underline">Fazer novo pedido</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-lavanda-50 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
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
          <div className="bg-gradient-lavanda p-6 text-white text-center rounded-t-2xl">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Upload size={24} />
            </div>
            <h1 className="text-xl font-black">Pagamento</h1>
            <p className="text-lavanda-200 text-sm mt-1">{order.numeroPedido}</p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {order.formaPagamento === 'cartao' ? (
              order.status !== STATUS.AGUARDANDO_PAGAMENTO ? (
                <div className="flex flex-col items-center gap-3 text-center py-6">
                  <CheckCircle size={40} className="text-green-500" />
                  <p className="font-bold text-lavanda-900">Pagamento já confirmado</p>
                  <p className="text-lavanda-500 text-sm">
                    Acompanhe o andamento do seu pedido na consulta de status.
                  </p>
                  <Link
                    to={`/consulta?pedido=${order.numeroPedido}`}
                    className="text-lavanda-600 font-semibold hover:underline text-sm"
                  >
                    Ver status do pedido
                  </Link>
                </div>
              ) : (
                <CardCheckoutRedirect order={order} />
              )
            ) : (
              <>
                {/* Payment instructions */}
                <div>
                  <h2 className="text-lg font-bold text-lavanda-900 mb-4">1. Realize o PIX</h2>
                  <PaymentInstructions order={order} />
                </div>

                {/* Upload receipt */}
                <div>
                  <h2 className="text-lg font-bold text-lavanda-900 mb-4">2. Comprovante (opcional)</h2>
                  <ReceiptUpload
                    order={order}
                    onSuccess={() => {
                      setUploadDone(true)
                      setTimeout(() => navigate(`/consulta?pedido=${order.numeroPedido}`), 3000)
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>

        <p className="text-center text-lavanda-400 text-xs mt-6">
          Pedido <strong>{order.numeroPedido}</strong> ·{' '}
          {order.status === STATUS.AGUARDANDO_PAGAMENTO ? 'Aguardando pagamento' : 'Pagamento confirmado'}
        </p>
      </div>
    </div>
  )
}
