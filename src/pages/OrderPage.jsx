import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import OrderForm from '@/components/order/OrderForm'
import OrderSuccess from '@/components/order/OrderSuccess'

export default function OrderPage() {
  const [completedOrder, setCompletedOrder] = useState(null)

  return (
    <div className="min-h-screen bg-lavanda-50 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Back link */}
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
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-lavanda-100 overflow-hidden"
        >
          {/* Header */}
          {!completedOrder && (
            <div className="bg-gradient-hero p-8 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={28} />
              </div>
              <h1 className="text-2xl font-black mb-1">Encomendar Camisa</h1>
              <p className="text-lavanda-200 text-sm">UMADGOV 2026 — Vós sois geração eleita</p>
              <div className="flex justify-center gap-6 mt-5">
                <div className="text-center">
                  <p className="text-white font-black text-xl">R$ 50</p>
                  <p className="text-lavanda-300 text-xs">por unidade</p>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-white font-black text-xl">23/09</p>
                  <p className="text-lavanda-300 text-xs">prazo</p>
                </div>
              </div>
            </div>
          )}

          {/* Form / Success */}
          <div className="p-6 sm:p-8">
            {completedOrder ? (
              <OrderSuccess order={completedOrder} />
            ) : (
              <OrderForm onSuccess={setCompletedOrder} />
            )}
          </div>
        </motion.div>

        {!completedOrder && (
          <p className="text-center text-lavanda-400 text-xs mt-6">
            Após o pedido, você receberá as instruções de pagamento via Pix
          </p>
        )}
      </div>
    </div>
  )
}
