import React from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Link,
  Stack,
} from "@mui/material"

const CartItem = ({ item, onRemove }) => {
  return (
    <Card
      sx={{
        mb: 2,
        boxShadow: "none",
        border: "none",
        backgroundColor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: "column", sm: "row" },
            pt: { xs: 3, sm: 2 },
          }}
        >
          {/* Image */}
          <CardMedia
            component="img"
            sx={{
              width: { xs: "100%", sm: 200 },
              height: { xs: 200, sm: 120 },
              borderRadius: 1,
              flexShrink: 0,
            }}
            image={item.image}
            alt={item.title}
          />

          {/* Content and Actions Container */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 0 },
            }}
          >
            {/* Course Info */}
            <Box sx={{ flex: 1, pr: { md: 3 } }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  color: "text.primary",
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                {item.title}
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: 1,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                {item.instructor}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  flexWrap: "wrap",
                }}
              >
                {item.bestseller && (
                  <Chip
                    label="Bestseller"
                    size="small"
                    sx={{
                      backgroundColor: "background.muted",
                      color: "text.primary",
                      fontWeight: "bold",
                      fontSize: { xs: "0.625rem", sm: "0.75rem" },
                    }}
                  />
                )}
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    color: "text.primary",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  {item.rating}
                </Typography>
                <Rating value={item.rating} readOnly size="small" precision={0.1} />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  ({item.reviews.toLocaleString()} ratings)
                </Typography>
              </Box>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                {item.totalHours} • {item.lectures} • {item.level}
              </Typography>
            </Box>

            {/* Actions and Price */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", md: "column" },
                alignItems: { xs: "center", md: "flex-end" },
                justifyContent: { xs: "space-between", md: "flex-start" },
                gap: 2,
                minWidth: { md: 200 },
                pr: { md: 2 },
              }}
            >
              {/* Action Links */}
              <Stack
                direction={{ xs: "row", md: "row" }}
                spacing={1}
                sx={{
                  flexWrap: "wrap",
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                }}
              >
                <Link
                  component="button"
                  variant="body1"
                  sx={{
                    color: "brand.main",
                    textDecoration: "none",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                  underline="hover"
                  onClick={() => onRemove(item.id)}
                >
                  Remove
                </Link>
                <Link
                  component="button"
                  variant="body1"
                  sx={{
                    color: "brand.main",
                    textDecoration: "none",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                  underline="hover"
                >
                  Save for Later
                </Link>
                <Link
                  component="button"
                  variant="body1"
                  sx={{
                    color: "brand.main",
                    textDecoration: "none",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                  underline="hover"
                >
                  Move to Wishlist
                </Link>
              </Stack>

              {/* Price */}
              <Box sx={{ textAlign: { xs: "right", md: "right" } }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    color: "brand.main",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  {item.currentPrice}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    textDecoration: "line-through",
                    color: "text.secondary",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  {item.originalPrice}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CartItem