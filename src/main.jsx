import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    borderRadius: '12px',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    border: '1px solid #C084FC',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.88rem',
                    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.08)',
                    whiteSpace: 'nowrap',
                    maxWidth: 'none',
                  },
                  success: {
                    style: {
                      borderColor: '#8B5CF6',
                    },
                    iconTheme: {
                      primary: '#8B5CF6',
                      secondary: '#FFFFFF',
                    },
                  },
                  error: {
                    style: {
                      borderColor: '#EF4444',
                    },
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#FFFFFF',
                    },
                  },
                }}
              />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)
