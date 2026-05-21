import React, { useEffect, useState, useMemo } from "react"
import {
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  Alert,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material"
import LocalOfferIcon from "@mui/icons-material/LocalOffer"
import LoadingSpinner from "../../../components/LoadingSpinner"
import CartItem from "./CartItem"
import { useCart } from "../../../hooks/cart-hooks/useCart"
import { useNavigate } from "react-router"
import { toast } from "react-toastify"
import NoResult from "../../../components/NoResult"
import emptyCartImg from "../../../assets/images/empty-cart.png"
import useCouponClient from "../../../hooks/coupon-hooks/useCouponClient"

const CartPage = () => {
  const navigate = useNavigate()
  const { cartItems, loading, error, removeFromCart } = useCart()
  const { validateCoupon } = useCouponClient()
  const [items, setItems] = useState([])
  const [savingItemId, setSavingItemId] = useState(null)
  const [couponInput, setCouponInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`
  }

  useEffect(() => {
    setItems(cartItems.map(item => ({ ...item, isSaved: false })))
  }, [cartItems])

  const cartTotalPrice = useMemo(() => {
    return items
      .filter(item => !item.isSaved)
      .reduce((sum, item) => sum + (item.price ?? 0), 0)
  }, [items])

  const discountedTotal = appliedCoupon ? appliedCoupon.discountedTotal : cartTotalPrice
  const couponDiscount = appliedCoupon ? appliedCoupon.totalDiscountAmount : 0
  const appliedCouponItems = appliedCoupon?.items ?? []
  const appliedCouponDiscountedItems = appliedCouponItems.filter(item => (item.discountAmount ?? 0) > 0)
  const isPartialCoupon = Boolean(
    appliedCoupon &&
    appliedCouponDiscountedItems.length > 0 &&
    appliedCouponDiscountedItems.length < appliedCouponItems.length
  )

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    const courseIds = items
      .filter(item => !item.isSaved)
      .map(item => Number(item.courseId ?? item.id))
      .filter(id => id > 0)

    setCouponLoading(true)
    try {
      const result = await validateCoupon(couponInput.trim().toUpperCase(), courseIds)
      if (result?.isValid) {
        setAppliedCoupon(result)
        const discountedItems = (result.items ?? []).filter(item => (item.discountAmount ?? 0) > 0)
        const partialApplied = discountedItems.length > 0 && discountedItems.length < (result.items?.length ?? 0)
        const savings = Number(result.totalDiscountAmount ?? 0)
        toast.success(
          partialApplied
            ? `Coupon applied to eligible courses only. You save $${savings.toFixed(2)}`
            : `Coupon applied! You save $${savings.toFixed(2)}`
        )
      } else {
        toast.error(result?.errorMessage || "Invalid coupon code")
        setAppliedCoupon(null)
      }
    } catch {
      toast.error("Failed to validate coupon")
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput("")
  }

  const cartItemCount = useMemo(() => {
    return items.filter(item => !item.isSaved).length
  }, [items])

  const handleSaveForLater = async (itemId) => {
    setSavingItemId(itemId)
    try {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, isSaved: true } : item
        )
      )
    } catch (err) {
      console.error('Failed to save for later:', err)
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, isSaved: false } : item
        )
      )
    } finally {
      setSavingItemId(null)
    }
  }

  const handleMoveToCart = async (itemId) => {
    setSavingItemId(itemId)
    try {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, isSaved: false } : item
        )
      )
    } catch (err) {
      console.error('Failed to move to cart:', err)
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, isSaved: true } : item
        )
      )
    } finally {
      setSavingItemId(null)
    }
  }

  const handleCheckout = () => {
    const checkoutItems = items.filter(item => !item.isSaved)

    if (checkoutItems.length === 0) {
      return
    }

    const courses = checkoutItems.map(ci => ({
      id: ci.courseId ?? ci.id,
      title: ci.title,
      subtitle: ci.subtitle ?? '',
      price: ci.price ?? 0,
      imageUrl: ci.imageUrl ?? '',
      categoryTitle: ci.categoryTitle ?? ''
    }))

    navigate('/payment/checkout', {
      state: {
        courses,
        totalAmount: cartTotalPrice,
        couponCode: appliedCoupon ? appliedCoupon.couponCode : "",
        couponDiscount,
      }
    })
  }

  if (loading && cartItems.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box sx={{ flex: 1, py: 4, display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner />
        </Box>
      </Box>
    )
  }

  if (error && cartItems.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box sx={{ flex: 1, py: 4, px: 2, maxWidth: 1200, mx: 'auto' }}>
          <Alert severity="error">Failed to load cart items. Please try again later.</Alert>
        </Box>
      </Box>
    )
  }

  if (cartItems.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box sx={{ flex: 1, py: 4, px: 2, maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <NoResult
            image={emptyCartImg}
            title="Your cart is empty"
            description="Browse our courses and add some to your cart!"
            sx={{ py: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                backgroundColor: 'brand.main',
                '&:hover': { backgroundColor: 'brand.dark' },
                textTransform: 'none',
                px: 4,
                py: 1.2,
                fontWeight: 600,
              }}
            >
              Browse Courses
            </Button>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}>
      <Box sx={{ flex: 1, py: { xs: 2, sm: 3, md: 4 } }}>
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
            {cartItemCount} {cartItemCount === 1 ? 'Course' : 'Courses'} in Cart
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
              {items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <CartItem
                    item={item}
                    onRemove={removeFromCart}
                    onSaveForLater={handleSaveForLater}
                    onMoveToCart={handleMoveToCart}
                    loading={savingItemId === item.id}
                    isSavedForLater={item.isSaved}
                  />
                  {index < items.length - 1 && <Divider sx={{ my: 2 }} />}
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
              {/* Coupon Input */}
              <Box sx={{ mb: 2 }}>
                {appliedCoupon ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      icon={<LocalOfferIcon fontSize="small" />}
                      label={appliedCoupon.couponCode}
                      color="success"
                      onDelete={handleRemoveCoupon}
                      size="small"
                    />
                    <Typography variant="body2" color="success.main">
                      -${couponDiscount.toFixed(2)}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocalOfferIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flex: 1, "& .MuiOutlinedInput-root": { fontSize: "0.85rem" } }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || couponLoading}
                      sx={{ whiteSpace: "nowrap", textTransform: "none" }}
                    >
                      Apply
                    </Button>
                  </Box>
                )}
                {appliedCoupon && isPartialCoupon && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    This coupon applied to {appliedCouponDiscountedItems.length} of {appliedCouponItems.length} eligible courses. Courses that opted out kept their original price.
                  </Alert>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

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

                {appliedCoupon && (
                  <Typography
                    variant="body2"
                    sx={{ textDecoration: "line-through", color: "text.disabled", mb: 0.5 }}
                  >
                    {formatPrice(cartTotalPrice)}
                  </Typography>
                )}

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    color: appliedCoupon ? "success.main" : "text.primary",
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                  }}
                >
                  {formatPrice(discountedTotal)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                disabled={cartItemCount === 0}
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
    </Box>
  )
}

export default CartPage