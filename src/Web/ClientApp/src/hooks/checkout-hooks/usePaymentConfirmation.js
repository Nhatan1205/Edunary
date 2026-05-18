import usePaymentClient from "./usePaymentClient"
import { useNavigate } from "react-router"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { extractApiError } from "../../utils/helpers.js"

const getErrorMessage = (error, fallback) =>
  extractApiError(error) || error?.message || fallback

export default function usePaymentConfirmation() {
  const { confirmPayment } = usePaymentClient()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const confirmPaymentAndNavigate = async (paymentIntentId, courses = [], totalAmount = 0) => {
    try {
      const confirmResponse = await confirmPayment(paymentIntentId)
      if (confirmResponse?.success) {
        queryClient.invalidateQueries(["cart"])
        navigate('/payment-success', {
          state: {
            paymentIntentId,
            courses,
            totalAmount,
            orderId: confirmResponse.orderId,
          },
        })
        return { success: true, orderId: confirmResponse.orderId }
      }

      const message = confirmResponse?.message || 'Failed to confirm payment'
      return { success: false, message }
    } catch (err) {
      console.error('Error confirming payment:', err)
      const message = getErrorMessage(err, 'Failed to confirm payment')
      toast.error(message)
      return { success: false, message }
    }
  }

  return { confirmPaymentAndNavigate }
}
