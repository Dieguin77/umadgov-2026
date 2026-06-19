import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5533999186633'
const WA_MSG = encodeURIComponent('Olá! Tenho dúvidas em relação a compra das camisas, poderia me ajudar?. ')

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setShowTooltip(true), 500)
      const hideTimer = setTimeout(() => setShowTooltip(false), 5000)
      return () => { clearTimeout(timer); clearTimeout(hideTimer) }
    }
  }, [visible])

  const href = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-xl shadow-lg px-4 py-2.5 text-sm font-medium text-lavanda-800 border border-lavanda-100 whitespace-nowrap"
              >
                Fale conosco pelo WhatsApp! 👋
                <button
                  onClick={() => setShowTooltip(false)}
                  className="ml-2 text-lavanda-300 hover:text-lavanda-500"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <MessageCircle size={28} className="text-white fill-white" />
          </motion.a>
        </div>
      )}
    </AnimatePresence>
  )
}
