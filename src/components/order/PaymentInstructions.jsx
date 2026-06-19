import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, CheckCheck, Smartphone, CreditCard, AlertCircle, MapPin, Check } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import toast from 'react-hot-toast'

const PIX_KEY = '52.161.276/0001-55'

const PAYMENT_CARDS = [
  {
    id: 'pix',
    icon: Smartphone,
    title: 'PIX',
    subtitle: 'Transferência instantânea',
    color: 'text-green-600',
    iconBg: 'bg-green-100',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  {
    id: 'credito',
    icon: CreditCard,
    title: 'Cartão de Crédito',
    subtitle: 'Na retirada presencialmente',
    color: 'text-blue-600',
    iconBg: 'bg-blue-100',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'debito',
    icon: CreditCard,
    title: 'Cartão de Débito',
    subtitle: 'Na retirada presencialmente',
    color: 'text-violet-600',
    iconBg: 'bg-violet-100',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
  },
]

export default function PaymentInstructions({ order }) {
  const [copied, setCopied] = useState(false)
  const forma = order?.formaPagamento || 'pix'

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

      {/* Payment methods overview */}
      <div>
        <p className="text-sm font-bold text-lavanda-800 mb-3 uppercase tracking-wide">Formas de Pagamento</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PAYMENT_CARDS.map(card => {
            const isSelected = forma === card.id
            return (
              <div
                key={card.id}
                className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                  isSelected ? `${card.border} bg-white shadow-sm` : 'border-lavanda-100 bg-lavanda-50/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? card.iconBg : 'bg-lavanda-100'}`}>
                  <card.icon size={20} className={isSelected ? card.color : 'text-lavanda-300'} />
                </div>
                <div className="min-w-0">
                  <p className={`font-bold text-sm ${isSelected ? 'text-lavanda-900' : 'text-lavanda-400'}`}>{card.title}</p>
                  <p className={`text-xs ${isSelected ? 'text-lavanda-500' : 'text-lavanda-300'}`}>{card.subtitle}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-lavanda-600 rounded-full flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* PIX instructions */}
      {forma === 'pix' && (
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

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Chave PIX (CNPJ)</p>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="font-black text-gray-800 text-base sm:text-lg tracking-wider">{PIX_KEY}</span>
                <motion.button
                  onClick={copyPix}
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
                'Acesse a área de Pix',
                `Digite a chave: ${PIX_KEY}`,
                `Informe o valor exato: ${formatCurrency(order.valor)}`,
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
      )}

      {/* Card payment instructions */}
      {(forma === 'credito' || forma === 'debito') && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white border-2 rounded-2xl p-6 ${forma === 'credito' ? 'border-blue-100' : 'border-violet-100'}`}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${forma === 'credito' ? 'bg-blue-100' : 'bg-violet-100'}`}>
              <CreditCard size={22} className={forma === 'credito' ? 'text-blue-600' : 'text-violet-600'} />
            </div>
            <div>
              <h3 className="font-bold text-lavanda-900">
                {forma === 'credito' ? 'Cartão de Crédito' : 'Cartão de Débito'}
              </h3>
              <p className="text-lavanda-400 text-sm">Pagamento presencial</p>
            </div>
          </div>

          <div className="bg-lavanda-50 rounded-xl p-4 flex items-start gap-3">
            <MapPin size={20} className="text-lavanda-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-lavanda-800 mb-0.5">Local de pagamento e retirada</p>
              <p className="text-lavanda-600 text-sm">Igreja Evangélica Assembleia de Deus</p>
              <p className="text-lavanda-500 text-sm">Rua Afonso Pena, 3384 — Centro, Governador Valadares/MG</p>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {[
              'Seu pedido foi registrado com sucesso',
              'Compareça ao local de retirada na data combinada',
              `Leve o número do pedido: ${order.numeroPedido}`,
              `Realize o pagamento de ${formatCurrency(order.valor)} no cartão`,
              'Retire sua camisa UMADGOV 2026',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-lavanda-600">
                <div className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${forma === 'credito' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'}`}>
                  {i + 1}
                </div>
                {step}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Alert for PIX */}
      {forma === 'pix' && (
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-amber-700 text-sm">
            Após realizar o Pix, <strong>envie o comprovante</strong> abaixo para confirmar seu pagamento. Sem o comprovante, o pedido permanecerá como "Aguardando pagamento".
          </p>
        </div>
      )}

      {/* Info for card */}
      {(forma === 'credito' || forma === 'debito') && (
        <div className="flex gap-3 bg-lavanda-50 border border-lavanda-100 rounded-xl p-4">
          <AlertCircle size={20} className="text-lavanda-500 shrink-0 mt-0.5" />
          <p className="text-lavanda-600 text-sm">
            O pagamento por cartão poderá ser realizado <strong>presencialmente no momento da retirada</strong>. Não é necessário enviar comprovante.
          </p>
        </div>
      )}
    </div>
  )
}
