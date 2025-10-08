import { useState, useEffect } from "react"
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
  CircularProgress,
  Alert
} from "@mui/material"
import { 
  CheckCircle as CheckCircleIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
  School as SchoolIcon
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
// NOTE: Renamed from PaymentClient to PaymentEndpointsClient to match generated client export
import { PaymentEndpointsClient } from "../../../web-api-client.ts"

export default function PaymentSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get data from navigation state
  const { paymentIntentId, userEmail, courses, totalAmount, orderId } = location.state || {}

  useEffect(() => {
    if (!paymentIntentId) {
      toast.error("Invalid payment session")
      navigate("/")
      return
    }

    fetchPaymentStatus()
  }, [paymentIntentId, navigate])

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true)
  const paymentClient = new PaymentEndpointsClient()
      
      // Step 5: Get final payment status
      const response = await paymentClient.getPaymentStatus(paymentIntentId)
      setPaymentStatus(response)
      
    } catch (error) {
      console.error("Error fetching payment status:", error)
      setError("Failed to fetch payment status")
      toast.error("Failed to fetch payment status")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToHome = () => {
    navigate("/")
  }

  const handleViewCourses = () => {
    navigate("/my-courses")
  }

  if (!paymentIntentId) {
    return null
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ color: "#6366f1", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Verifying payment...
            </Typography>
          </Box>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleBackToHome}>
          Back to Home
        </Button>
      </Container>
    )
  }

  const isPaymentSuccessful = paymentStatus?.paymentStatus === 'succeeded' && 
                             paymentStatus?.orderStatus === 'Completed'

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid #e0e7ff" }}>
        {/* Success Icon and Title */}
        <Box sx={{ mb: 4 }}>
          {isPaymentSuccessful ? (
            <CheckCircleIcon sx={{ fontSize: 80, color: "#22c55e", mb: 2 }} />
          ) : (
            <Alert severity="error" sx={{ mb: 2 }}>
              Payment verification failed
            </Alert>
          )}
          
          <Typography variant="h3" fontWeight="bold" color={isPaymentSuccessful ? "#22c55e" : "#ef4444"} sx={{ mb: 1 }}>
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
                  <Typography variant="h6" fontWeight="bold" color="#6366f1">
                    ₫{paymentStatus.amount.toLocaleString()}
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
                    borderBottom: index < paymentStatus.orderItems.length - 1 ? "1px solid #e5e7eb" : "none"
                  }}
                >
                  <Typography variant="body1">
                    {item.courseName}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ₫{item.price.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
          {isPaymentSuccessful && (
            <Button
              variant="contained"
              size="large"
              startIcon={<SchoolIcon />}
              onClick={handleViewCourses}
              sx={{
                backgroundColor: "#6366f1",
                "&:hover": { backgroundColor: "#5855eb" }
              }}
            >
              View My Courses
            </Button>
          )}
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleBackToHome}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}