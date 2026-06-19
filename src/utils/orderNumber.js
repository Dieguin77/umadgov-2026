export const generateOrderNumber = (index) => {
  const num = String(index).padStart(4, '0')
  return `UMD-2026-${num}`
}

export const generateOrderId = () => {
  return `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
