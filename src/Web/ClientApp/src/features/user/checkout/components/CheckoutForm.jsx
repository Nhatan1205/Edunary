import { useState } from "react"
import { Box, Button, Alert } from "@mui/material"
import LockIcon from "@mui/icons-material/Lock"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { PaymentEndpointsClient } from "../../../../web-api-client.ts"
import BillingAddress from "./BillingAddress"
import OrderDetails from "./OrderDetails"

export default function CheckoutForm({ 
  courses, 
  totalPrice, 
  country, 
  setCountry, 
  paymentMethod, 
  setPaymentMethod,
  clientSecret,
  paymentIntentId
}) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Step 3: Submit payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?payment_intent=${paymentIntentId}`,
        },
        redirect: 'if_required'
      })

      if (stripeError) {
        setError(stripeError.message)
        toast.error(stripeError.message)
        return
      }

      // Check if payment succeeded
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Step 4: Confirm payment on our backend
        try {
          const paymentClient = new PaymentEndpointsClient()
          const confirmResponse = await paymentClient.confirmPayment({
            paymentIntentId: paymentIntent.id
          })

          if (confirmResponse.success) {
            // Step 5: Navigate to success page with state
            navigate('/payment-success', {
              state: {
                paymentIntentId: paymentIntent.id,
                courses: courses,
                totalAmount: totalPrice,
                orderId: confirmResponse.orderId
              }
            })
          } else {
            setError(confirmResponse.message || 'Failed to confirm payment')
            toast.error(confirmResponse.message || 'Failed to confirm payment')
          }
        } catch (confirmError) {
          console.error('Error confirming payment:', confirmError)
          setError('Failed to confirm payment on server')
          toast.error('Payment succeeded but failed to confirm on server. Please contact support.')
        }
      } else {
        setError('Payment was not completed successfully')
        toast.error('Payment was not completed successfully')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred during payment')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <BillingAddress country={country} setCountry={setCountry} />
      
      {/* Stripe Payment Element */}
      <Box sx={{ my: 3 }}>
        <PaymentElement />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <OrderDetails courses={courses} />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={!stripe || processing}
        startIcon={<LockIcon />}
        sx={{
          backgroundColor: processing ? "#9ca3af" : "#6366f1",
          color: "white",
          py: 1.5,
          fontSize: "1rem",
          fontWeight: 600,
          textTransform: "none",
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
          "&:hover": {
            backgroundColor: processing ? "#9ca3af" : "#5855eb",
            boxShadow: "0 6px 16px rgba(99, 102, 241, 0.5)",
          },
          "&:disabled": {
            backgroundColor: "#9ca3af",
            color: "white",
          },
        }}
      >
        {processing ? "Processing..." : `Complete Purchase - ₫${totalPrice.toLocaleString()}`}
      </Button>
    </Box>
  )
}