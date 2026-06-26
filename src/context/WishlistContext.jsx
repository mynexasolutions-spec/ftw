import { createContext, useContext, useEffect, useState } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ftw_wishlist') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('ftw_wishlist', JSON.stringify(wishlistItems))
  }, [wishlistItems])

  function toggleWishlist(product) {
    setWishlistItems(prev => {
      const exists = prev.some(item => item.id === product.id)
      if (exists) {
        return prev.filter(item => item.id !== product.id)
      }
      return [...prev, product]
    })
  }

  function isInWishlist(productId) {
    return wishlistItems.some(item => item.id === productId)
  }

  function clearWishlist() {
    setWishlistItems([])
  }

  const wishlistCount = wishlistItems.length

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, clearWishlist, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
