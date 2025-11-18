import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CartClient } from '../web-api-client.ts'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

export const useCart = () => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const { data: cartItems = [], isLoading: loading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const cartClient = new CartClient()
      const items = await cartClient.getCartItems()
      return items || []
    },
    enabled: isAuthenticated,
  })

  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId) => {
      const cartClient = new CartClient()
      await cartClient.removeFromCart(cartItemId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"])
      toast.success('Item removed from cart')
    },
    onError: (err) => {
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
    }
  })

  const removeFromCart = async (cartItemId) => {
    try {
      await removeFromCartMutation.mutateAsync(cartItemId)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return {
    cartItems,
    loading,
    error,
    removeFromCart,
    refetch: () => queryClient.invalidateQueries(["cart"]),
  }
}
