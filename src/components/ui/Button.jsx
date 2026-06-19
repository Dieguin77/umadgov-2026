import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-lavanda-700 hover:bg-lavanda-800 text-white shadow-lavanda hover:shadow-lavanda-lg',
  secondary: 'bg-dourado-500 hover:bg-dourado-600 text-white shadow-gold hover:shadow-gold-lg',
  outline: 'border-2 border-lavanda-600 text-lavanda-600 hover:bg-lavanda-600 hover:text-white',
  'outline-gold': 'border-2 border-dourado-500 text-dourado-600 hover:bg-dourado-500 hover:text-white',
  ghost: 'text-lavanda-700 hover:bg-lavanda-100',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  white: 'bg-white text-lavanda-700 hover:bg-lavanda-50 shadow-md',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
  xl: 'px-9 py-4 text-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  icon: Icon,
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
      ) : null}
      {children}
    </motion.button>
  )
}
