import { useState } from "react"
import { Container, Box, Paper, Grid, Divider } from "@mui/material"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import CheckoutHeader from "./components/CheckoutHeader"
import CheckoutForm from "./components/CheckoutForm"
import OrderSummary from "./components/OrderSummary"

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SEp4nDIrw4XMXOl149X6uisdUL3Q9PETF8IivdhUcKJ37agAI8zWE0OGLRkSQOKbnM5ssHDcHDPaPBlpt43uaIP00Qt4bNVJY')

export default function CheckoutPage() {
  const [country, setCountry] = useState("Vietnam")
  const [paymentMethod, setPaymentMethod] = useState("card")

  const courses = [
    {
      id: 1,
      title: "Learn Ethical Hacking From Scratch",
      price: 2309000,
      image: "/ethical-hacking-course-thumbnail.jpg",
    },
    {
      id: 2,
      title: "100 Days of Code: The Complete Python Pro Bootcamp",
      price: 2159000,
      image: "/python-programming-course-thumbnail.jpg",
    },
    {
      id: 3,
      title: "Ultimate AWS Certified Solutions Architect Associate 2025",
      price: 2499000,
      image: "/aws-cloud-architecture-course-thumbnail.jpg",
    },
  ]

  const totalPrice = courses.reduce((sum, course) => sum + course.price, 0)

  return (
    <Elements stripe={stripePromise}>
      <Box sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl">
          <CheckoutHeader />

          <Grid container spacing={3}>
            {/* Left Column - Checkout Form */}
            <Grid item xs={12} lg={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: "white",
                  borderRadius: 2,
                  border: "1px solid #e0e7ff",
                }}
              >
                <CheckoutForm 
                  courses={courses}
                  totalPrice={totalPrice}
                  country={country}
                  setCountry={setCountry}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                />
              </Paper>
            </Grid>

            {/* Right Column - Order Summary */}
            <Grid item xs={12} lg={4}>
              <OrderSummary courses={courses} totalPrice={totalPrice} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Elements>
  )
}
