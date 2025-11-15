import React from "react"
import {
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  Alert,
} from "@mui/material"
import LoadingSpinner from "../../../components/LoadingSpinner"
import CartItem from "./CartItem"
import { useCart } from "../../../hooks/useCart"
import { useNavigate } from "react-router"

const CartPage = () => {
  const navigate = useNavigate()
  const { cartItems, loading, error, removeFromCart, totalPrice, itemCount } = useCart()

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`
  }

  if (loading && cartItems.length === 0) {
    return (
      <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', minHeight: '50vh' }}>
        <LoadingSpinner />
      </Box>
    )
  }

  if (error && cartItems.length === 0) {
    return (
      <Box sx={{ py: 4, px: 2, maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="error">Failed to load cart items. Please try again later.</Alert>
      </Box>
    )
  }

  if (cartItems.length === 0) {
    return (
      <Box sx={{ py: 4, px: 2, maxWidth: 1200, mx: 'auto' }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2 }}>Your cart is empty</Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Browse our courses and add some to your cart!
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: 'brand.main',
              '&:hover': { backgroundColor: 'brand.dark' }
            }}
          >
            Browse Courses
          </Button>
        </Paper>
      </Box>
    )
  }

  const handleCheckout = () => {
    const courses = cartItems.map(ci => ({
      id: ci.courseId ?? ci.id,
      title: ci.title,
      subtitle: ci.subtitle ?? '',
      price: ci.price ?? 0,
      imageUrl: ci.imageUrl ?? ci.image ?? '',
      categoryTitle: ci.categoryTitle ?? ci.category ?? ''
    }))

    navigate('/payment/checkout', {
      state: {
        courses,
        totalAmount: totalPrice
      }
    })
  }

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      bgcolor: 'background.default',
      py: { xs: 2, sm: 3, md: 4 }
    }}>
      <Box sx={{ 
        maxWidth: 1400, 
        mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 }
      }}>
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
          {itemCount} {itemCount === 1 ? 'Course' : 'Courses'} in Cart
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
                <CartItem item={item} onRemove={removeFromCart} loading={loading} />
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
                {formatPrice(totalPrice)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckout}
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
      </Box>
    </Box>
  )
}

export default CartPage