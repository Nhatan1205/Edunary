import { useState } from "react"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"

export function useCheckout() {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const processPayment = async (paymentMethod, country) => {
    if (!stripe || !elements) {
      return { success: false, error: "Stripe not loaded" }
    }

    setProcessing(true)
    setError(null)

    try {
      if (paymentMethod === "card") {
        const card = elements.getElement(CardElement)

        const { error, paymentMethod: stripePaymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: card,
          billing_details: {
            address: {
              country: country === "Vietnam" ? "VN" : country === "United States" ? "US" : "GB",
            },
          },
        })

        if (error) {
          setError(error.message)
          setProcessing(false)
          return { success: false, error: error.message }
        } else {
          // Success case
          setProcessing(false)
          return { success: true, paymentMethod: stripePaymentMethod }
        }
      } else {
        // Handle other payment methods
        setProcessing(false)
        return { success: true, paymentMethod: paymentMethod }
      }
    } catch (err) {
      setError(err.message)
      setProcessing(false)
      return { success: false, error: err.message }
    }
  }

  return {
    processPayment,
    processing,
    error,
    setError
  }
}