import { motion } from 'framer-motion'
import { CheckCircle, Copy, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function OrderSuccess({ order }) {
  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.numeroPedido)
    toast.success('Número do pedido copiado!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center py-8"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle size={40} className="text-green-600" />
      </motion.div>

      <h2 className="text-2xl font-black text-lavanda-900 mb-2">Pedido realizado!</h2>
      <p className="text-lavanda-500 mb-8">
        Seu pedido foi registrado. Agora realize o pagamento via Pix.
      </p>

      {/* Order number */}
      <div className="bg-lavanda-50 border border-lavanda-200 rounded-2xl p-5 mb-6 inline-block w-full max-w-sm mx-auto">
        <p className="text-lavanda-500 text-xs uppercase tracking-wider mb-2">Número do pedido</p>
        <div className="flex items-center justify-center gap-3">
          <span className="font-black text-2xl text-lavanda-800 tracking-wider">{order.numeroPedido}</span>
          <button
            onClick={copyOrderNumber}
            className="p-2 rounded-lg bg-lavanda-200 hover:bg-lavanda-300 text-lavanda-600 transition-colors"
          >
            <Copy size={16} />
          </button>
        </div>
        <p className="text-lavanda-400 text-xs mt-2">Guarde este número para consultar seu pedido</p>
      </div>

      {/* Order details */}
      <div className="bg-white border border-lavanda-100 rounded-2xl p-5 mb-8 text-left max-w-sm mx-auto">
        <p className="text-lavanda-500 text-xs uppercase tracking-wider mb-3">Detalhes</p>
        {[
          { label: 'Nome', value: order.nome },
          { label: 'Tamanho', value: order.tamanho },
          { label: 'Quantidade', value: `${order.quantidade} ${order.quantidade === 1 ? 'camisa' : 'camisas'}` },
          { label: 'Total', value: formatCurrency(order.valor) },
          { label: 'Data', value: formatDateTime(order.createdAt) },
        ].map(item => (
          <div key={item.label} className="flex justify-between py-2 border-b border-lavanda-50 last:border-0">
            <span className="text-lavanda-400 text-sm">{item.label}</span>
            <span className="text-lavanda-800 font-semibold text-sm">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Link to={`/enviar-comprovante?pedido=${order.numeroPedido}`}>
          <Button variant="secondary" size="lg" icon={ArrowRight} className="w-full sm:w-auto">
            Ir para o pagamento
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Voltar ao início
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
