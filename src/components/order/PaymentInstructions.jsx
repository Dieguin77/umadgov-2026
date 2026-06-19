import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, CheckCheck, Smartphone, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import toast from 'react-hot-toast'

const PIX_KEY = '52.161.276/0001-55'

export default function PaymentInstructions({ order }) {
  const [copied, setCopied] = useState(false)

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY)
    setCopied(true)
    toast.success('Chave Pix copiada!')
    setTimeout(() => setCopied(false), 3000)
  }

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

      {/* Pix instructions */}
      <div className="bg-white border-2 border-lavanda-100 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Smartphone size={22} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-lavanda-900">Pagamento via Pix</h3>
            <p className="text-lavanda-400 text-sm">Transferência instantânea</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Chave Pix (CNPJ)</p>
            <div className="flex items-center justify-between gap-3">
              <span className="font-black text-gray-800 text-lg tracking-wider">{PIX_KEY}</span>
              <motion.button
                onClick={copyPix}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-lavanda-600 text-white hover:bg-lavanda-700'
                }`}
              >
                {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </motion.button>
            </div>
          </div>

          <ol className="space-y-3">
            {[
              'Abra o aplicativo do seu banco',
              'Acesse a área de Pix',
              `Digite a chave: ${PIX_KEY}`,
              `Informe o valor exato: ${formatCurrency(order.valor)}`,
              'Confirme o pagamento e salve o comprovante',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-lavanda-600">
                <span className="w-6 h-6 rounded-full bg-lavanda-100 text-lavanda-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Alert */}
      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-amber-700 text-sm">
          Após realizar o Pix, <strong>envie o comprovante</strong> abaixo para confirmar seu pagamento. Sem o comprovante, o pedido permanecerá como "Aguardando pagamento".
        </p>
      </div>
    </div>
  )
}
