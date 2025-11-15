import { useState } from 'react'
import { CartClient } from '../web-api-client.ts'
import { toast } from 'react-toastify'

export const useAddToCart = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addToCart = async (courseId) => {
    try {
      setLoading(true)
      setError(null)
      
      const cartClient = new CartClient()
      await cartClient.addToCart({ courseId: courseId.toString() })
      
      toast.success('Course added to cart successfully!')
      return { success: true }
    } catch (err) {
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
      
      toast.error(errorMessage)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    addToCart,
    loading,
    error
  }
}
