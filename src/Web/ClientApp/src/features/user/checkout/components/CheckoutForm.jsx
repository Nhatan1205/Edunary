import { useState } from "react"
import { Box, Button, Alert } from "@mui/material"
import LockIcon from "@mui/icons-material/Lock"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { toast } from "react-toastify"
import usePaymentConfirmation from "../../../../hooks/checkout-hooks/usePaymentConfirmation"
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
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const { confirmPaymentAndNavigate } = usePaymentConfirmation()

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
          const res = await confirmPaymentAndNavigate(paymentIntent.id, courses, totalPrice)
          if (!res.success) {
            setError(res.message || 'Failed to confirm payment')
            toast.error(res.message || 'Failed to confirm payment')
          }
        } catch (confirmError) {
          setError('Failed to confirm payment')
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
          bgcolor: processing ? "action.disabled" : "brand.main",
          color: "common.white",
          py: 1.5,
          fontSize: "1rem",
          fontWeight: 600,
          textTransform: "none",
          borderRadius: 2,
          boxShadow: 3,
          "&:hover": {
            bgcolor: processing ? "action.disabled" : "brand.dark",
            boxShadow: 4,
          },
          "&:disabled": {
            bgcolor: "action.disabled",
            color: "common.white",
          },
        }}
      >
        {processing ? "Processing..." : `Complete Purchase - $${totalPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </Button>
    </Box>
  )
}