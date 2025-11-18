import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CartClient, AddToCartCommand } from '../web-api-client.ts'
import { toast } from 'react-toastify'

export const useAddToCart = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (courseId) => {
      const cartClient = new CartClient()
      const command = new AddToCartCommand({ courseId: courseId.toString() })
      return await cartClient.addToCart(command)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"])
      toast.success('Course added to cart successfully!')
    },
    onError: (err) => {
      console.error('Error adding to cart:', err)
      
      // Extract error message from response
      let errorMessage = 'Failed to add course to cart'
      
      // SwaggerException has response as JSON string
      if (err.response) {
        try {
          const errorData = JSON.parse(err.response)
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          } else if (errorData && errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors[0]
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError)
          // If parsing fails, try to use response directly
          if (typeof err.response === 'string') {
            errorMessage = err.response
          }
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      if (
        errorMessage === "This course is already in your cart" ||
        errorMessage === "This course has already been paid for by you"
      ) {
        toast.info(errorMessage)
      } else {
        toast.error(errorMessage)
      }
    }
  })

  const addToCart = async (courseId) => {
    try {
      await mutation.mutateAsync(courseId)
      return { success: true }
    } catch (err) {
      let errorMessage = 'Failed to add course to cart'
      if (err.response) {
        try {
          const errorData = JSON.parse(err.response)
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          } else if (errorData && errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors[0]
          }
        } catch (parseError) {
          if (typeof err.response === 'string') {
            errorMessage = err.response
          }
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      return { success: false, error: errorMessage }
    }
  }

  return {
    addToCart,
    loading: mutation.isPending,
    error: mutation.error
  }
}
