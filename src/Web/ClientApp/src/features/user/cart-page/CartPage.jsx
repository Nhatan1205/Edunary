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

  const activeItems = useMemo(() => {
    return items.filter(item => !item.isSaved)
  }, [items])

  const savedItems = useMemo(() => {
    return items.filter(item => item.isSaved)
  }, [items])
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
              mb: 1,
              fontWeight: "bold",
              color: "text.primary",
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
            }}
          >
            Shopping Cart
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mb: 3,
              color: "text.secondary",
              fontWeight: 500,
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            {cartItemCount} {cartItemCount === 1 ? 'Course' : 'Courses'} in Cart
          </Typography>

          {/* Main Content */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 3, lg: 5 },
              flexDirection: { xs: "column", lg: "row" },
              alignItems: "flex-start",
            }}
          >
            {/* Cart Items List */}
            <Box sx={{ flex: 1, width: "100%" }}>
              {activeItems.length === 0 ? (
                <Alert severity="info" sx={{ mb: 4, borderRadius: 1 }}>
                  Your cart is empty. Keep shopping to find courses!
                </Alert>
              ) : (
                <Box
                  sx={{
                    borderTop: "1px solid #d1d7dc",
                    borderBottom: "1px solid #d1d7dc",
                    py: 1,
                    mb: 4,
                  }}
                >
                  {activeItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <CartItem
                        item={item}
                        onRemove={removeFromCart}
                        onSaveForLater={handleSaveForLater}
                        onMoveToCart={handleMoveToCart}
                        loading={savingItemId === item.id}
                        isSavedForLater={false}
                      />
                      {index < activeItems.length - 1 && (
                        <Divider sx={{ my: 1.5, borderColor: "#d1d7dc" }} />
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              )}

              {/* Saved For Later Section */}
              {savedItems.length > 0 && (
                <Box sx={{ mt: 5 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      mb: 0.5,
                      color: "text.primary",
                      fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    }}
                  >
                    Saved for later
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2,
                      color: "text.secondary",
                      fontWeight: 500,
                    }}
                  >
                    {savedItems.length} {savedItems.length === 1 ? 'Course' : 'Courses'} saved for later
                  </Typography>
                  <Box
                    sx={{
                      borderTop: "1px solid #d1d7dc",
                      borderBottom: "1px solid #d1d7dc",
                      py: 1,
                    }}
                  >
                    {savedItems.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <CartItem
                          item={item}
                          onRemove={removeFromCart}
                          onSaveForLater={handleSaveForLater}
                          onMoveToCart={handleMoveToCart}
                          loading={savingItemId === item.id}
                          isSavedForLater={true}
                        />
                        {index < savedItems.length - 1 && (
                          <Divider sx={{ my: 1.5, borderColor: "#d1d7dc" }} />
                        )}
                      </React.Fragment>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Order Summary */}
            <Paper
              sx={{
                width: { xs: "100%", lg: 350 },
                height: "fit-content",
                p: { xs: 2, sm: 3 },
                boxShadow: "none",
                borderRadius: 2,
                border: "1px solid #d1d7dc",
                backgroundColor: "background.paper",
                position: { lg: "sticky" },
                top: { lg: 100 },
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: "text.secondary",
                    fontWeight: "bold",
                    fontSize: "1rem",
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
                    mb: 1.5,
                    color: "text.primary",
                    fontSize: { xs: "1.75rem", sm: "2.25rem" },
                  }}
                >
                  {formatPrice(discountedTotal)}
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  disabled={cartItemCount === 0}
                  sx={{
                    backgroundColor: "brand.main",
                    "&:hover": { backgroundColor: "brand.dark" },
                    py: 1.5,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    borderRadius: 1,
                  }}
                >
                  Proceed to Checkout
                </Button>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1.5,
                    textAlign: "center",
                    fontSize: "0.8rem",
                  }}
                >
                  You won't be charged yet
                </Typography>
              </Box>

              <Divider sx={{ my: 2, borderColor: "#d1d7dc" }} />

              {/* Coupon Section */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", mb: 1, color: "text.primary" }}
                >
                  Promotions
                </Typography>
                {appliedCoupon ? (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "background.muted", p: 1, borderRadius: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocalOfferIcon fontSize="small" sx={{ color: "brand.main" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {appliedCoupon.couponCode}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: "bold", color: "success.main" }}>
                        -${couponDiscount.toFixed(2)}
                      </Typography>
                      <Button
                        size="small"
                        onClick={handleRemoveCoupon}
                        sx={{ minWidth: 0, p: 0.5, color: "error.main", textTransform: "none" }}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Enter Coupon"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocalOfferIcon fontSize="small" sx={{ color: "text.secondary" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flex: 1, "& .MuiOutlinedInput-root": { fontSize: "0.85rem" } }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim() || couponLoading}
                      sx={{
                        whiteSpace: "nowrap",
                        textTransform: "none",
                        bgcolor: "brand.main",
                        "&:hover": { bgcolor: "brand.dark" },
                        fontWeight: "bold",
                      }}
                    >
                      Apply
                    </Button>
                  </Box>
                )}
                {appliedCoupon && isPartialCoupon && (
                  <Alert severity="info" sx={{ mt: 1.5, fontSize: "0.75rem", py: 0.5 }}>
                    This coupon applied to {appliedCouponDiscountedItems.length} of {appliedCouponItems.length} eligible courses. Courses that opted out kept their original price.
                  </Alert>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CartPage