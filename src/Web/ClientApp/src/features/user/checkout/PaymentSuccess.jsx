import { useEffect } from "react"
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert
} from "@mui/material"
import {
  CheckCircle as CheckCircleIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
  School as SchoolIcon
} from "@mui/icons-material"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"
import usePaymentStatus from "../../../hooks/checkout-hooks/usePaymentStatus"
import LoadingSpinner from "../../../components/LoadingSpinner"

export default function PaymentSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { paymentIntentId: statePaymentIntentId } = location.state || {}
  const paymentIntentId = statePaymentIntentId || searchParams.get("payment_intent")
  const { paymentStatus, loading, error } = usePaymentStatus(paymentIntentId)

  useEffect(() => {
    if (!paymentIntentId) {
      toast.error("Invalid payment session")
      navigate("/")
      return
    }
  }, [paymentIntentId, navigate])

  const handleBackToHome = () => {
    navigate("/")
  }

  if (!paymentIntentId) {
    return null
  }

  if (loading) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="md">
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <LoadingSpinner size={60} message="Verifying payment..." />
          </Box>
        </Container>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained"
            sx={{
              borderColor: "brand.main",
              color: "brand.dark",
              fontWeight: 600,
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              fontSize: "1rem",
              "&:hover": {
                borderColor: "brand.dark",
                bgcolor: "brand.lighter",
              },
            }} onClick={handleBackToHome}>
            Back to Home
          </Button>
        </Container>
      </Box>
    )
  }

  const isPaymentSuccessful = paymentStatus?.paymentStatus === 'succeeded' &&
    paymentStatus?.orderStatus === 'Completed'

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
          {/* Success Icon and Title */}
          <Box sx={{ mb: 4 }}>
            {isPaymentSuccessful ? (
              <CheckCircleIcon sx={{ fontSize: 80, color: "brand.main", mb: 2 }} />
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                Payment verification failed
              </Alert>
            )}

            <Typography variant="h3" fontWeight="bold" color={isPaymentSuccessful ? "brand.main" : "error.main"} sx={{ mb: 1 }}>
              {isPaymentSuccessful ? "Payment Successful!" : "Payment Failed"}
            </Typography>

            <Typography variant="h6" color="text.secondary">
              {isPaymentSuccessful
                ? "Thank you for your purchase. You now have access to your courses."
                : "There was an issue processing your payment."}
            </Typography>
          </Box>

          {/* Payment Details */}
          {paymentStatus && (
            <Card sx={{ mb: 4, textAlign: "left" }}>
              <CardContent>
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  <ReceiptIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Payment Details
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Order ID
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {paymentStatus.orderId}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Status
                    </Typography>
                    <Chip
                      label={paymentStatus.paymentStatus}
                      color={paymentStatus.paymentStatus === 'succeeded' ? 'success' : 'error'}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Amount Paid
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="brand.main">
                      {paymentStatus.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Date
                    </Typography>
                    <Typography variant="body1">
                      {paymentStatus.paymentDate
                        ? new Date(paymentStatus.paymentDate).toLocaleString()
                        : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Course List */}
          {paymentStatus?.orderItems && paymentStatus.orderItems.length > 0 && (
            <Card sx={{ mb: 4, textAlign: "left" }}>
              <CardContent>
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Purchased Courses
                  </Typography>
                </Box>

                {paymentStatus.orderItems.map((item, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      py: 1,
                      borderBottom: index < paymentStatus.orderItems.length - 1 ? 1 : 0,
                      borderColor: "divider"
                    }}
                  >
                    <Typography variant="body1">
                      {item.courseName}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: "brand.main",
                color: "brand.main",
                fontWeight: 600,
                px: 3,
                py: 1.25,
                borderRadius: "12px",
                fontSize: "1rem",
                "&:hover": {
                  borderColor: "brand.dark",
                  bgcolor: "brand.lighter",
                },
              }}
              startIcon={<HomeIcon />}
              onClick={handleBackToHome}
            >
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}