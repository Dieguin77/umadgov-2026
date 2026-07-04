import { useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, CheckCheck, Smartphone, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { buildPixPayload } from '@/utils/pixPayload'
import toast from 'react-hot-toast'

const PIX_KEY = '52161276000155'
const MERCHANT_NAME = 'UMADGOV 2026'
const MERCHANT_CITY = 'Governador Valadares'

export default function PaymentInstructions({ order }) {
  const [copied, setCopied] = useState(false)

  const pixCode = buildPixPayload({
    pixKey: PIX_KEY,
    merchantName: MERCHANT_NAME,
    merchantCity: MERCHANT_CITY,
    amount: order.valor,
    txid: order.numeroPedido,
  })

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode)
    setCopied(true)
    toast.success('Código Pix copiado!')
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

      {/* PIX instructions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-green-100 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Smartphone size={22} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-lavanda-900">Pagamento via PIX</h3>
            <p className="text-lavanda-400 text-sm">Transferência instantânea</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 bg-gray-50 rounded-xl p-5">
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <QRCodeSVG value={pixCode} size={200} level="M" />
            </div>
            <p className="text-xs text-gray-500 text-center">Escaneie o QR Code com o app do seu banco</p>
          </div>

          {/* Copia e Cola */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pix Copia e Cola</p>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="font-mono text-gray-800 text-xs break-all">{pixCode}</span>
              <motion.button
                onClick={copyPixCode}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all shrink-0 ${
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

          <ol className="space-y-2.5">
            {[
              'Abra o aplicativo do seu banco',
              'Acesse a área Pix e escolha "Pix Copia e Cola" ou escaneie o QR Code',
              'Cole o código ou aponte a câmera para o QR Code acima',
              `Confira o valor: ${formatCurrency(order.valor)}`,
              'Confirme o pagamento e salve o comprovante',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-lavanda-600">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </motion.div>

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
