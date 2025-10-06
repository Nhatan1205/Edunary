import { useState } from "react"
import { Box, Button } from "@mui/material"
import LockIcon from "@mui/icons-material/Lock"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"
import BillingAddress from "./BillingAddress"
import PaymentMethodSelector from "./PaymentMethodSelector"
import OrderDetails from "./OrderDetails"

export default function CheckoutForm({ 
  courses, 
  totalPrice, 
  country, 
  setCountry, 
  paymentMethod, 
  setPaymentMethod 
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError(null)

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
      } else {
        console.log('Payment Method:', stripePaymentMethod)
        setTimeout(() => {
          setProcessing(false)
          alert('Payment processed successfully!')
        }, 2000)
      }
    } else {
      setTimeout(() => {
        setProcessing(false)
        alert(`Payment with ${paymentMethod} processed successfully!`)
      }, 2000)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <BillingAddress country={country} setCountry={setCountry} />
      
      <PaymentMethodSelector 
        paymentMethod={paymentMethod} 
        setPaymentMethod={setPaymentMethod}
        error={error}
      />
      
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