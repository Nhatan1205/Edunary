import { Box, Typography, Paper, Divider, Link, Card, CardContent, Chip } from "@mui/material"
import LocalOfferIcon from "@mui/icons-material/LocalOffer"

export default function OrderSummary({ courses, totalPrice, originalTotal, couponCode, couponDiscount, vatAmount = 0, vatRate = 0 }) {
  const hasDiscount = couponDiscount > 0
  const hasVat = vatAmount > 0
  return (
    <Box sx={{ position: "sticky", top: 20 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
          Order Summary
        </Typography>

        {/* Course List */}
        <Box sx={{ mb: 3 }}>
          {courses.map((course) => (
            <Box key={course.id} sx={{ display: "flex", alignItems: "center", mb: 2, pb: 2, borderBottom: 1, borderColor: "divider" }}>
              <Box
                component="img"
                src={course.imageUrl || "https://blocks.astratic.com/img/general-img-landscape.png"}
                alt={course.title}
                sx={{ width: 60, height: 40, objectFit: "cover", borderRadius: 1, mr: 2 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>{course.title}</Typography>
                <Typography variant="caption" color="text.secondary">{course.categoryTitle}</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ${course.price}
              </Typography>
            </Box>
          ))}
        </Box>

        {hasDiscount && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<LocalOfferIcon fontSize="small" />}
              label={couponCode}
              color="success"
              size="small"
              variant="outlined"
            />
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography color="text.secondary">Original Price:</Typography>
            <Typography sx={{ fontWeight: 500, textDecoration: hasDiscount ? "line-through" : "none", color: hasDiscount ? "text.disabled" : "text.primary" }}>
              ${(originalTotal ?? totalPrice).toLocaleString()}
            </Typography>
          </Box>
          {hasDiscount && (
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography color="success.main">Coupon discount:</Typography>
              <Typography sx={{ fontWeight: 500, color: "success.main" }}>-${couponDiscount.toFixed(2)}</Typography>
            </Box>
          )}
          {hasVat && (
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography color="text.secondary">VAT ({(vatRate * 100).toFixed(0)}%):</Typography>
              <Typography sx={{ fontWeight: 500 }}>+${vatAmount.toFixed(2)}</Typography>
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
              Total ({courses.length} {courses.length === 1 ? 'course' : 'courses'}):
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "brand.main" }}>
              ${totalPrice.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
          By completing your purchase, you agree to our{" "}
          <Link href="#" sx={{ color: "brand.main", textDecoration: "none" }}>
            Terms of Service
          </Link>
          {" "}and{" "}
          <Link href="#" sx={{ color: "brand.main", textDecoration: "none" }}>
            Privacy Policy
          </Link>
          .
        </Typography>
      </Paper>

      <Card
        variant="outlined"
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}>
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