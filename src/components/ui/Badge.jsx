import { STATUS, STATUS_LABELS, STATUS_COLORS } from '@/data/mockOrders'

const colorMap = {
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  purple: 'bg-lavanda-100 text-lavanda-800 border-lavanda-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  gold: 'bg-dourado-100 text-dourado-800 border-dourado-200',
}

export function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'gray'
  const label = STATUS_LABELS[status] || status
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colorMap[color]}`}>
      {label}
    </span>
  )
}

export default function Badge({ children, color = 'purple', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colorMap[color]} ${className}`}>
      {children}
    </span>
  )
}
