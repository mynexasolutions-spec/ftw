import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [animatingProduct, setAnimatingProduct] = useState(null)
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ftw_cart') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('ftw_cart', JSON.stringify(items))
  }, [items])

  function addToCart(product, size, color, skipAnimation = false) {
    if (!size) {
      alert("Please select a size first.")
      return
    }

    // Resolve default color if not specified
    let selectedColor = color
    if (!selectedColor) {
      const colorsArr = Array.isArray(product.colors)
        ? product.colors
        : (product.colors ? String(product.colors).split(',').map(c => c.trim()) : [])
      if (colorsArr.length > 0) {
        selectedColor = colorsArr[0].replace(/\s*\(#[0-9a-fA-F]{3,6}\)/, '').trim()
      } else {
        selectedColor = 'Standard'
      }
    }

    setItems(prev => {
      const existing = prev.find(i => i.id === product.id && i.size === size && i.color === selectedColor)
      if (existing) {
        return prev.map(i => (i.id === product.id && i.size === size && i.color === selectedColor) ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...product, size, color: selectedColor, qty: 1 }]
    })

    if (!skipAnimation) {
      setAnimatingProduct({ ...product, size, color: selectedColor })
    }
  }

  function removeFromCart(id, size, color) {
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size && i.color === color)))
  }

  function updateQty(id, size, color, qty) {
    if (qty < 1) {
      removeFromCart(id, size, color)
      return
    }
    setItems(prev => prev.map(i => (i.id === id && i.size === size && i.color === color) ? { ...i, qty } : i))
  }

  function clearCart() {
    setItems([])
  }

  const cartCount = items.reduce((sum, i) => sum + i.qty, 0)
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal, cartOpen, setCartOpen, animatingProduct, setAnimatingProduct }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
