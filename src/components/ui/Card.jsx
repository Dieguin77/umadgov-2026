import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = false, gold = false, onClick }) {
  const base = `
    bg-white rounded-2xl shadow-sm border
    ${gold ? 'border-dourado-200 shadow-gold' : 'border-lavanda-100 shadow-lavanda'}
    ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''}
    ${className}
  `

  if (hover || onClick) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={base}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )
  }

  return <div className={base}>{children}</div>
}
