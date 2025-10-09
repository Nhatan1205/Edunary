import { Box, Typography } from "@mui/material"

export default function CheckoutHeader() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a1a1a", mb: 1 }}>
        Checkout
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Complete your purchase to access your courses
      </Typography>
    </Box>
  )
}