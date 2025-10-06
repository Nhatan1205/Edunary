import { Box, Typography, Paper, Divider, Link, Card, CardContent } from "@mui/material"

export default function OrderSummary({ courses, totalPrice }) {
  return (
    <Box sx={{ position: "sticky", top: 20 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: "white",
          borderRadius: 2,
          border: "1px solid #e0e7ff",
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#1a1a1a" }}>
          Order Summary
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography color="text.secondary">Original Price:</Typography>
            <Typography sx={{ fontWeight: 500 }}>₫{totalPrice.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography color="text.secondary">Discount:</Typography>
            <Typography sx={{ fontWeight: 500, color: "#10b981" }}>-₫0</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
              Total ({courses.length} courses):
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#6366f1" }}>
              ₫{totalPrice.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
          By completing your purchase, you agree to our{" "}
          <Link href="#" sx={{ color: "#6366f1", textDecoration: "none" }}>
            Terms of Service
          </Link>
          {" "}and{" "}
          <Link href="#" sx={{ color: "#6366f1", textDecoration: "none" }}>
            Privacy Policy
          </Link>
          .
        </Typography>
      </Paper>

      <Card
        variant="outlined"
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          border: "1px solid #e0e7ff",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "#1a1a1a" }}>
            30-Day Money-Back Guarantee
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            Not satisfied with your purchase? Get a full refund within 30 days, no questions asked!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}