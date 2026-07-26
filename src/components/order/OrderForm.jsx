import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { User, Phone, Church, Ruler, Hash, ShoppingBag, Smartphone, CreditCard, Shirt, Baby } from 'lucide-react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import SelectableCards from '@/components/ui/SelectableCards'
import { validators } from '@/utils/validators'
import { formatPhoneInput, formatCurrency } from '@/utils/formatters'
import { orderService } from '@/services/orderService'
import { SHIRT_SIZES, SHIRT_PRICE, SHIRT_MODEL_LABELS, FORMA_PAGAMENTO_LABELS } from '@/data/mockOrders'
import toast from 'react-hot-toast'

const PAYMENT_OPTIONS = [
  {
    value: 'pix',
    label: 'PIX',
    desc: 'Pague online agora',
    icon: Smartphone,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-500',
  },
  {
    value: 'cartao',
    label: 'Cartão de Crédito',
    desc: 'Em até 3x, via InfinitePay',
    icon: CreditCard,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-500',
  },
]

const SHIRT_MODEL_OPTIONS = [
  {
    value: 'masculino',
    label: SHIRT_MODEL_LABELS.masculino,
    desc: 'Corte tradicional',
    icon: Shirt,
    color: 'text-lavanda-600',
    bg: 'bg-lavanda-50',
    border: 'border-lavanda-500',
  },
  {
    value: 'baby_look',
    label: SHIRT_MODEL_LABELS.baby_look,
    desc: 'Corte feminino',
    icon: Shirt,
    color: 'text-dourado-600',
    bg: 'bg-dourado-50',
    border: 'border-dourado-500',
  },
  {
    value: 'infantil',
    label: SHIRT_MODEL_LABELS.infantil,
    desc: 'Tamanhos infantis',
    icon: Baby,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
  },
]

export default function OrderForm({ onSuccess }) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { quantidade: 1, tamanho: '', shirtModel: '', formaPagamento: 'pix', observacoes: '' },
  })

  const quantidade = Number(watch('quantidade') || 1)
  const shirtModel = watch('shirtModel')
  const formaPagamento = watch('formaPagamento')
  const total = quantidade * SHIRT_PRICE

  const handlePhoneInput = (e) => {
    setValue('telefone', formatPhoneInput(e.target.value), { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const order = await orderService.createOrder({
        nome: data.nome.trim(),
        telefone: data.telefone,
        congregacao: data.congregacao.trim(),
        shirtModel: data.shirtModel,
        tamanho: data.tamanho,
        quantidade: Number(data.quantidade),
        formaPagamento: data.formaPagamento,
        observacoes: data.observacoes?.trim() || null,
      })
      toast.success('Pedido criado com sucesso!')
      onSuccess(order)
    } catch (err) {
      toast.error('Erro ao criar pedido: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Shirt model */}
      <div>
        <label className="text-sm font-semibold text-lavanda-900 block mb-3">
          Selecione o modelo da camisa <span className="text-red-500">*</span>
        </label>
        <SelectableCards
          options={SHIRT_MODEL_OPTIONS}
          register={register}
          name="shirtModel"
          validation={{ required: 'Selecione o modelo da camisa para continuar.' }}
          watchValue={shirtModel}
          error={errors.shirtModel?.message}
        />
      </div>

      {/* 2. Tamanho + 3. Quantidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Select
          label="Tamanho"
          placeholder="Selecione o tamanho"
          icon={Ruler}
          error={errors.tamanho?.message}
          required
          options={SHIRT_SIZES.map(s => ({ value: s, label: s }))}
          {...register('tamanho', validators.size)}
        />

        <Input
          label="Quantidade"
          type="number"
          placeholder="1"
          icon={Hash}
          min={1}
          max={20}
          error={errors.quantidade?.message}
          required
          {...register('quantidade', validators.quantity)}
        />
      </div>

      {/* 4. Dados pessoais */}
      <div>
        <label className="text-sm font-semibold text-lavanda-900 block mb-3">
          Dados Pessoais
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <Input
              label="Nome Completo"
              placeholder="Digite seu nome completo"
              icon={User}
              error={errors.nome?.message}
              required
              {...register('nome', validators.name)}
            />
          </div>

          <Input
            label="Telefone / WhatsApp"
            placeholder="(33) 99999-9999"
            icon={Phone}
            error={errors.telefone?.message}
            required
            {...register('telefone', validators.phone)}
            onChange={handlePhoneInput}
          />

          <Input
            label="Congregação"
            placeholder="Nome da sua congregação"
            icon={Church}
            error={errors.congregacao?.message}
            required
            {...register('congregacao', validators.congregation)}
          />

          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-lavanda-900 block mb-1.5">
              Observações <span className="text-lavanda-400 font-normal">(opcional)</span>
            </label>
            <textarea
              placeholder="Alguma observação sobre seu pedido..."
              rows={3}
              {...register('observacoes')}
              className="w-full rounded-xl border-2 border-lavanda-200 bg-white px-4 py-3 text-lavanda-900 placeholder:text-lavanda-300 transition-all focus:outline-none focus:border-lavanda-500 focus:ring-2 focus:ring-lavanda-100 resize-none"
            />
          </div>
        </div>
      </div>

      {/* 5. Payment method */}
      <div>
        <label className="text-sm font-semibold text-lavanda-900 block mb-3">
          Forma de Pagamento <span className="text-red-500">*</span>
        </label>
        <SelectableCards
          options={PAYMENT_OPTIONS}
          register={register}
          name="formaPagamento"
          validation={{ required: 'Selecione a forma de pagamento.' }}
          watchValue={formaPagamento}
          error={errors.formaPagamento?.message}
        />
      </div>

      {/* Order Summary */}
      <motion.div
        key={total}
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        className="bg-lavanda-50 border border-lavanda-200 rounded-2xl p-5"
      >
        <p className="text-lavanda-600 text-sm font-semibold mb-3 uppercase tracking-wide">Resumo do pedido</p>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-lavanda-500">Valor unitário</span>
            <span className="text-lavanda-700">R$ 50,00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-lavanda-500">Quantidade</span>
            <span className="text-lavanda-700">{quantidade} {quantidade === 1 ? 'camisa' : 'camisas'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-lavanda-500">Pagamento</span>
            <span className="text-lavanda-700">{FORMA_PAGAMENTO_LABELS[formaPagamento] || '—'}</span>
          </div>
          <div className="border-t border-lavanda-200 pt-2 flex justify-between font-black text-lg">
            <span className="text-lavanda-800">Total</span>
            <span className="text-dourado-600">{formatCurrency(total)}</span>
          </div>
        </div>
        <p className="text-lavanda-400 text-xs">
          {formaPagamento === 'cartao'
            ? 'Após o pedido você será redirecionado para pagar com cartão em ambiente seguro da InfinitePay'
            : 'Após o pedido você receberá as instruções de pagamento via Pix'}
        </p>
      </motion.div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={loading}
        icon={ShoppingBag}
        className="font-black text-lg py-4"
      >
        Finalizar Pedido
      </Button>
    </form>
  )
}
