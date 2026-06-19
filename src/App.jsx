import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AdminProvider } from '@/context/AdminContext'
import { OrderProvider } from '@/context/OrderContext'
import MainLayout from '@/layouts/MainLayout'
import HomePage from '@/pages/HomePage'
import OrderPage from '@/pages/OrderPage'
import PaymentPage from '@/pages/PaymentPage'
import OrderStatusPage from '@/pages/OrderStatusPage'
import AdminPage from '@/pages/AdminPage'
import LoginPage from '@/pages/LoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <OrderProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#2a2340',
                color: '#fff',
                borderRadius: '12px',
                padding: '14px 18px',
                fontSize: '14px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
              },
              success: {
                iconTheme: { primary: '#D4AF37', secondary: '#2a2340' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />

          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/pedido" element={<OrderPage />} />
              <Route path="/enviar-comprovante" element={<PaymentPage />} />
              <Route path="/consulta" element={<OrderStatusPage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </OrderProvider>
      </AdminProvider>
    </BrowserRouter>
  )
}
