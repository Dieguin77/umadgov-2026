import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { User, Phone, Church, Ruler, Hash, FileText, ShoppingBag } from 'lucide-react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { validators } from '@/utils/validators'
import { formatPhoneInput, formatCurrency } from '@/utils/formatters'
import { orderService } from '@/services/orderService'
import { SHIRT_SIZES, SHIRT_PRICE } from '@/data/mockOrders'
import toast from 'react-hot-toast'

export default function OrderForm({ onSuccess }) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { quantidade: 1, tamanho: '', observacoes: '' },
  })

  const quantidade = Number(watch('quantidade') || 1)
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
        tamanho: data.tamanho,
        quantidade: Number(data.quantidade),
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

        <Select
          label="Tamanho"
          placeholder="Selecione o tamanho"
          icon={Ruler}
          error={errors.tamanho?.message}
          required
          options={SHIRT_SIZES.map(s => ({ value: s, label: s }))}
          {...register('tamanho', validators.size)}
        />

        <div>
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
          <div className="border-t border-lavanda-200 pt-2 flex justify-between font-black text-lg">
            <span className="text-lavanda-800">Total</span>
            <span className="text-dourado-600">{formatCurrency(total)}</span>
          </div>
        </div>
        <p className="text-lavanda-400 text-xs">
          * Pagamento via Pix após confirmação do pedido
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
