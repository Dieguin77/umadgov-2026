import { createContext, useContext, useState } from 'react'

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const [currentOrder, setCurrentOrder] = useState(null)

  const setOrder = (order) => setCurrentOrder(order)
  const clearOrder = () => setCurrentOrder(null)

  return (
    <OrderContext.Provider value={{ currentOrder, setOrder, clearOrder }}>
      {children}
    </OrderContext.Provider>
  )
}

export const useOrder = () => {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder must be used inside OrderProvider')
  return ctx
}
