import { useState, useEffect, useMemo } from "react"
import { Container, Box, Paper, Grid, Button, Typography } from "@mui/material"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { useLocation, useNavigate } from "react-router"
import { toast } from "react-toastify"
import usePaymentInitialization from "../../../hooks/checkout-hooks/usePaymentInitialization"
import CheckoutHeader from "./components/CheckoutHeader"
import CheckoutForm from "./components/CheckoutForm"
import OrderSummary from "./components/OrderSummary"
import LoadingSpinner from "../../../components/LoadingSpinner"
import Key from "../../../configs/sso_key.json";
import theme from "../../../theme/theme";


// Initialize Stripe
if (!Key.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("REACT_APP_STRIPE_PUBLISHABLE_KEY environment variable must be set.");
}
const stripePromise = loadStripe(Key.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [country, setCountry] = useState("VN")
  const [paymentMethod, setPaymentMethod] = useState("card")

  const courses = useMemo(() => {
    return location.state?.courses || []
  }, [location.state?.courses])

  const couponCode = location.state?.couponCode || ""
  const couponDiscount = location.state?.couponDiscount || 0
  const originalTotal = location.state?.totalAmount ?? courses.reduce((sum, course) => sum + (course.price ?? 0), 0)
  const totalPrice = couponDiscount > 0 ? originalTotal - couponDiscount : originalTotal

  // Step 1: Create PaymentIntent (re-creates when country changes to pick up correct VAT)
  const { loading, clientSecret, paymentIntentId, initError, redirecting, vatAmount, vatRate } = usePaymentInitialization(courses, couponCode, country)
  const totalWithVat = totalPrice + vatAmount
  useEffect(() => {
    if (!courses.length) {
      toast.error("No courses selected for checkout")
      navigate("/")
      return
    }
  }, [courses, navigate])

  if (loading || redirecting) {
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

  if (initError || (!clientSecret && !redirecting)) {
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
        colorPrimary: theme.palette.brand.main,
      }
    }
  }

  return (
    <Elements key={clientSecret} stripe={stripePromise} options={stripeOptions}>
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
                  totalPrice={totalWithVat}
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
              <OrderSummary
                courses={courses}
                totalPrice={totalWithVat}
                originalTotal={originalTotal}
                couponCode={couponCode}
                couponDiscount={couponDiscount}
                vatAmount={vatAmount}
                vatRate={vatRate}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Elements>
  )
}
