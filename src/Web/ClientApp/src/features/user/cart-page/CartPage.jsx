import React, { useState } from "react"
import {
  Box,
  Container,
  Typography,
  Button,
  Divider,
  Paper,
} from "@mui/material"
import CartItem from "./CartItem"

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "Learn Ethical Hacking From Scratch",
      instructor: "By Zaid Sabih and 1 other",
      image: "https://media.istockphoto.com/id/627795510/photo/example.jpg?s=612x612&w=0&k=20&c=lpUf5rjPVd6Kl_M6heqC8sUncR4FLmtsRzeYdTr5X_I=",
      rating: 4.6,
      reviews: 93687,
      totalHours: "15.5 total hours",
      lectures: "143 lectures",
      level: "All Levels",
      currentPrice: "$369,000",
      originalPrice: "$2,239,000",
      bestseller: true,
    },
    {
      id: 2,
      title: "100 Days of Code: The Complete Python Pro Bootcamp",
      instructor: "By Dr. Angela Yu, Developer and Lead Instructor",
      image: "https://media.istockphoto.com/id/627795510/photo/example.jpg?s=612x612&w=0&k=20&c=lpUf5rjPVd6Kl_M6heqC8sUncR4FLmtsRzeYdTr5X_I=",
      rating: 4.7,
      reviews: 392950,
      totalHours: "56.5 total hours",
      lectures: "597 lectures",
      level: "All Levels",
      currentPrice: "$369,000",
      originalPrice: "$2,239,000",
      bestseller: true,
    },
    {
      id: 3,
      title: "Ultimate AWS Certified Solutions Architect Associate 2025",
      instructor: "By Stephane Maarek | AWS Certified Cloud Practitioner,Solutions Architect,Developer",
      image: "https://media.istockphoto.com/id/627795510/photo/example.jpg?s=612x612&w=0&k=20&c=lpUf5rjPVd6Kl_M6heqC8sUncR4FLmtsRzeYdTr5X_I=",
      rating: 4.7,
      reviews: 269774,
      totalHours: "27.5 total hours",
      lectures: "398 lectures",
      level: "All Levels",
      currentPrice: "$399,000",
      originalPrice: "$2,489,000",
      bestseller: true,
    },
  ])

  const totalOriginalPrice = cartItems.reduce((sum, item) => {
    return sum + Number.parseInt(item.originalPrice.replace(/[$,]/g, ""))
  }, 0)

  const totalCurrentPrice = cartItems.reduce((sum, item) => {
    return sum + Number.parseInt(item.currentPrice.replace(/[$,]/g, ""))
  }, 0)

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const formatPrice = (price) => {
    return `$${price.toLocaleString("en-IN")}`
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Typography
        variant="h3"
        component="h1"
        sx={{
          mb: 2,
          fontWeight: "bold",
          color: "text.primary",
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
        }}
      >
        Shopping Cart
      </Typography>

      <Typography
        variant="h4"
        sx={{
          mb: 4,
          color: "text.secondary",
          fontSize: { xs: "0.875rem", sm: "1rem", md: "1.25rem" },
        }}
      >
        {cartItems.length} Courses in Cart
      </Typography>

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          gap: { xs: 2, md: 4 },
          flexDirection: { xs: "column", lg: "row" },
        }}
      >
        {/* Cart Items */}
        <Box sx={{ flex: 1 }}>
          {cartItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <CartItem item={item} onRemove={removeItem} />
              {index < cartItems.length - 1 && <Divider sx={{ my: 2 }} />}
            </React.Fragment>
          ))}
        </Box>

        {/* Order Summary */}
        <Paper
          sx={{
            width: { xs: "100%", lg: 350 },
            height: "fit-content",
            p: { xs: 2, sm: 3 },
            boxShadow: 1,
            backgroundColor: "background.paper",
            position: { lg: "sticky" },
            top: { lg: 20 },
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                color: "text.secondary",
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Total:
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                mb: 1,
                color: "text.primary",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              {formatPrice(totalCurrentPrice)}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                textDecoration: "line-through",
                color: "text.secondary",
                mb: 1,
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              {formatPrice(totalOriginalPrice)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{
              backgroundColor: "brand.main",
              "&:hover": { backgroundColor: "brand.dark" },
              py: { xs: 1, sm: 1.5 },
              mb: 2,
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "1rem" },
              fontWeight: "bold",
            }}
          >
            Proceed to Checkout →
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              textAlign: "center",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            You won't be charged yet
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default CartPage