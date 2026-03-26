import usePaymentClient from "./usePaymentClient"
import { useNavigate } from "react-router"
import { toast } from "react-toastify"

export default function usePaymentConfirmation() {
  const { confirmPayment } = usePaymentClient()
  const navigate = useNavigate()

  const confirmPaymentAndNavigate = async (paymentIntentId, courses = [], totalAmount = 0) => {
    try {
      const confirmResponse = await confirmPayment(paymentIntentId)
      if (confirmResponse?.success) {
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

      return { success: false, message: confirmResponse?.message }
    } catch (err) {
      console.error('Error confirming payment:', err)
      toast.error('Payment succeeded but failed to confirm on server. Please contact support.')
      return { success: false, message: 'Failed to confirm payment' }
    }
  }

  return { confirmPaymentAndNavigate }
}
