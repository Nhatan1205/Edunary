import { useState, useEffect, useCallback } from 'react'
import { CartClient } from '../web-api-client.ts'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

export const useCart = () => {
  const { isAuthenticated } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCartItems = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const cartClient = new CartClient()
      const items = await cartClient.getCartItems()
      setCartItems(items || [])
    } catch (err) {
      console.error('Error fetching cart items:', err)
      setError(err)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const removeFromCart = async (cartItemId) => {
    try {
      setLoading(true)
      const cartClient = new CartClient()
      await cartClient.removeFromCart(cartItemId)
      
      // Remove item from local state
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId))
      toast.success('Item removed from cart')
      return { success: true }
    } catch (err) {
      console.error('Error removing from cart:', err)
      
      let errorMessage = 'Failed to remove item from cart'
      if (err.response) {
        try {
          const errorData = JSON.parse(err.response)
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError)
        }
      }
      
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.price, 0)
  }, [cartItems])

  const getItemCount = useCallback(() => {
    return cartItems.length
  }, [cartItems])

  useEffect(() => {
    fetchCartItems()
  }, [fetchCartItems])

  return {
    cartItems,
    loading,
    error,
    removeFromCart,
    refetch: fetchCartItems,
    totalPrice: getTotalPrice(),
    itemCount: getItemCount()
  }
}
