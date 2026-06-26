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
                    background: '#161616',
                    color: '#FAF9F6',
                    border: '1px solid #222222',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.88rem',
                  },
                  success: {
                    style: {
                      borderColor: '#E2F952',
                    },
                    iconTheme: {
                      primary: '#E2F952',
                      secondary: '#0B0B0B',
                    },
                  },
                  error: {
                    style: {
                      borderColor: '#FF4E20',
                    },
                    iconTheme: {
                      primary: '#FF4E20',
                      secondary: '#FAF9F6',
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
