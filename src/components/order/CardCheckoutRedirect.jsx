import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, ExternalLink, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { orderService } from '@/services/orderService'

export default function CardCheckoutRedirect({ order }) {
  const [checkoutUrl, setCheckoutUrl] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const startCheckout = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = await orderService.createCardCheckout(order.numeroPedido)
      setCheckoutUrl(url)
      window.location.href = url
    } catch (err) {
      setError(err.message || 'Não foi possível iniciar o pagamento por cartão.')
    } finally {
      setLoading(false)
    }
  }, [order.numeroPedido])

  useEffect(() => {
    startCheckout()
  }, [startCheckout])

  return (
    <div className="space-y-6">
      {/* Order summary bar */}
      <div className="bg-lavanda-50 border border-lavanda-200 rounded-2xl p-4 flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-lavanda-400 text-xs">Pedido</p>
          <p className="font-black text-lavanda-800">{order.numeroPedido}</p>
        </div>
        <div>
          <p className="text-lavanda-400 text-xs">Nome</p>
          <p className="font-bold text-lavanda-800 text-sm">{order.nome}</p>
        </div>
        <div>
          <p className="text-lavanda-400 text-xs">Quantidade</p>
          <p className="font-bold text-lavanda-800">{order.quantidade}x</p>
        </div>
        <div>
          <p className="text-lavanda-400 text-xs">Valor a pagar</p>
          <p className="font-black text-dourado-600 text-lg">{formatCurrency(order.valor)}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-blue-100 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <CreditCard size={22} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lavanda-900">Pagamento com Cartão</h3>
            <p className="text-lavanda-400 text-sm">Ambiente seguro InfinitePay</p>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-4 text-center py-6">
            <AlertTriangle size={32} className="text-red-500" />
            <p className="text-sm text-lavanda-700">{error}</p>
            <button
              onClick={startCheckout}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-lavanda-600 text-white hover:bg-lavanda-700 transition-all"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center py-6">
            <div className="w-10 h-10 border-4 border-lavanda-200 border-t-lavanda-600 rounded-full animate-spin" />
            <p className="text-sm text-lavanda-600">
              {loading ? 'Preparando seu pagamento...' : 'Redirecionando para o pagamento seguro...'}
            </p>
            {checkoutUrl && (
              <a
                href={checkoutUrl}
                className="inline-flex items-center gap-2 text-lavanda-600 hover:text-lavanda-800 text-sm font-semibold underline"
              >
                <ExternalLink size={14} />
                Clique aqui se não for redirecionado automaticamente
              </a>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
