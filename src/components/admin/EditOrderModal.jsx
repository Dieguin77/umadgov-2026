import { useForm } from 'react-hook-form'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { validators } from '@/utils/validators'
import { SHIRT_SIZES, SHIRT_PRICE } from '@/data/mockOrders'
import { formatCurrency } from '@/utils/formatters'
import { useState } from 'react'
import { Save } from 'lucide-react'

export default function EditOrderModal({ order, isOpen, onClose, onSave }) {
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: order ? {
      nome: order.nome,
      telefone: order.telefone,
      congregacao: order.congregacao,
      tamanho: order.tamanho,
      quantidade: order.quantidade,
      observacoes: order.observacoes || '',
    } : {},
  })

  const quantidade = Number(watch('quantidade') || 1)

  const onSubmit = async (data) => {
    setSaving(true)
    await onSave(order.id, {
      ...data,
      quantidade: Number(data.quantidade),
      valor: Number(data.quantidade) * SHIRT_PRICE,
    })
    setSaving(false)
    onClose()
  }

  if (!order) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar — ${order.numeroPedido}`} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nome" required error={errors.nome?.message} {...register('nome', validators.name)} />
        <Input label="Telefone" required error={errors.telefone?.message} {...register('telefone', validators.phone)} />
        <Input label="Congregação" required error={errors.congregacao?.message} {...register('congregacao', validators.congregation)} />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Tamanho"
            required
            error={errors.tamanho?.message}
            options={SHIRT_SIZES}
            {...register('tamanho', validators.size)}
          />
          <Input
            label="Quantidade"
            type="number"
            min={1}
            max={20}
            required
            error={errors.quantidade?.message}
            {...register('quantidade', validators.quantity)}
          />
        </div>

        <div className="bg-lavanda-50 rounded-xl p-3 text-sm flex justify-between">
          <span className="text-lavanda-500">Valor total atualizado</span>
          <span className="font-black text-dourado-600">{formatCurrency(quantidade * SHIRT_PRICE)}</span>
        </div>

        <div>
          <label className="text-sm font-semibold text-lavanda-900 block mb-1.5">Observações</label>
          <textarea
            rows={2}
            {...register('observacoes')}
            className="w-full rounded-xl border-2 border-lavanda-200 px-4 py-3 text-lavanda-900 focus:outline-none focus:border-lavanda-500 text-sm resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={saving} icon={Save} fullWidth>Salvar alterações</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </Modal>
  )
}
