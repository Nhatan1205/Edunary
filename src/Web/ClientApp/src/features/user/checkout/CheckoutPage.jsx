import { useState, useCallback, useEffect, useMemo } from "react"
import { Container, Box, Paper, Grid, Button, Typography } from "@mui/material"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { useLocation, useNavigate } from "react-router"
import { toast } from "react-toastify"
import { PaymentClient } from "../../../web-api-client.ts"
import { useAuth } from "../../../context/AuthContext"
import CheckoutHeader from "./components/CheckoutHeader"
import CheckoutForm from "./components/CheckoutForm"
import OrderSummary from "./components/OrderSummary"
import LoadingSpinner from "../../../components/LoadingSpinner"
import Key from "../../../configs/sso_key.json";


// Initialize Stripe
if (!Key.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("REACT_APP_STRIPE_PUBLISHABLE_KEY environment variable must be set.");
}
const stripePromise = loadStripe(Key.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [country, setCountry] = useState("Vietnam")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [clientSecret, setClientSecret] = useState("")
  const [paymentIntentId, setPaymentIntentId] = useState("")
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState("")

  const courses = useMemo(() => {
    return location.state?.courses || []
  }, [location.state?.courses])

  const totalPrice = location.state?.totalAmount || courses.reduce((sum, course) => sum + course.price, 0)

  const handleFreeCheckout = useCallback(
    async (paymentClient, paymentResult) => {
      const confirmResponse = await paymentClient.confirmPayment({
        paymentIntentId: paymentResult.paymentIntentId,
      })
      if (confirmResponse?.success) {
        navigate('/payment-success', {
          state: {
            paymentIntentId: paymentResult.paymentIntentId,
            courses: courses,
            totalAmount: totalPrice,
            orderId: confirmResponse.orderId,
          },
        })
      } else {
        toast.error(confirmResponse?.message || 'Failed to confirm free checkout')
        navigate('/')
      }
    }, [navigate, courses, totalPrice]
   )

  const createPaymentIntent = useCallback(async () => {
    try {
      setLoading(true)
      const paymentClient = new PaymentClient()

      const courseIds = courses.map(course => String(course.id || course.courseId))

      const response = await paymentClient.createPaymentIntent({
        courseIds: courseIds
      })

      if (!response?.result) {
        toast.error(response?.message)
        navigate("/")
        return
      }
      const paymentResult = response.result
      // Free checkout: Stripe does not create PaymentIntents for $0.
      // Nếu không có clientSecret thì xác nhận thanh toán miễn phí
      if (!paymentResult?.clientSecret) {
        await handleFreeCheckout(paymentClient, paymentResult)
        return
      }
      setClientSecret(paymentResult.clientSecret)
      setPaymentIntentId(paymentResult.paymentIntentId)

    } catch (error) {
      console.error("Error creating payment intent:", error)
      toast.error("Failed to initialize payment. Please try again.")
      setInitError("Failed to initialize payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [courses, navigate, handleFreeCheckout])

  // Step 1: Create PaymentIntent when component mounts
  useEffect(() => {
    if (!courses.length) {
      toast.error("No courses selected for checkout")
      navigate("/")
      return
    }

    createPaymentIntent()
  }, [courses, navigate, createPaymentIntent])

  if (loading) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl">
          <CheckoutHeader />
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <LoadingSpinner size={60} message="Initializing payment..." />
          </Box>
        </Container>
      </Box>
    )
  }

  if (initError || !clientSecret) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl">
          <CheckoutHeader />
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
            textAlign="center"
          >
            <Typography variant="h6" gutterBottom>
              {initError || "Unable to initialize payment at this time."}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{
                mt: 2,
                backgroundColor: "brand.main",
                "&:hover": { backgroundColor: "brand.dark" },
              }}
            >
              Go back to home
            </Button>
          </Box>
        </Container>
      </Box>
    )
  }

  const stripeOptions = {
    clientSecret: clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3FCCB2',
      }
    }
  }

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl">
          <CheckoutHeader />

          <Grid container spacing={3}>
            {/* Left Column - Checkout Form */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <CheckoutForm
                  courses={courses}
                  totalPrice={totalPrice}
                  country={country}
                  setCountry={setCountry}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  clientSecret={clientSecret}
                  paymentIntentId={paymentIntentId}
                />
              </Paper>
            </Grid>

            {/* Right Column - Order Summary */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <OrderSummary courses={courses} totalPrice={totalPrice} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Elements>
  )
}
