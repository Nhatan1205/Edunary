import React from "react"
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Chip,
} from "@mui/material"
import LocalOfferIcon from "@mui/icons-material/LocalOffer"
import LoadingSpinner from "../../../components/LoadingSpinner"
import { useNavigate } from "react-router"
import DefaultImage from "../../../assets/images/default.jpg"

const CartItem = ({ item, onRemove, onSaveForLater, onMoveToCart, loading, isSavedForLater = false }) => {
  const handleRemove = async () => {
    await onRemove(item.id)
  }
  const imageUrl = item.imageUrl || DefaultImage
  const handleSaveOrMove = async () => {
    if (isSavedForLater) {
      await onMoveToCart(item.id)
    } else {
      await onSaveForLater(item.id)
    }
  }
  const navigate = useNavigate()
  const handleCardClick = () => {
    const courseId = item.courseId ?? item.id
    navigate(`/course/${courseId}`)
  }

  const hasDiscount = item.originalPrice && item.originalPrice > item.price

  return (
    <Card
      sx={{
        boxShadow: "none",
        border: "none",
        backgroundColor: "transparent",
        borderRadius: 0,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 2, sm: 3 },
            flexDirection: { xs: "column", sm: "row" },
            py: 2,
          }}
        >
          {/* Image */}
          <CardMedia
            component="img"
            sx={{
              width: { xs: "100%", sm: 120 },
              height: { xs: 120, sm: 68 },
              borderRadius: 0.5,
              flexShrink: 0,
              cursor: "pointer",
            }}
            image={imageUrl}
            alt={item.title}
            onClick={handleCardClick}
          />
          {/* Content and Actions Container */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 3 },
            }}
          >
            {/* Course Info Column */}
            <Box
              sx={{
                flex: 1,
                cursor: "pointer",
              }}
              onClick={handleCardClick}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: "bold",
                  mb: 0.5,
                  color: "text.primary",
                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                  lineHeight: 1.3,
                  "&:hover": {
                    color: "brand.main",
                  },
                }}
              >
                {item.title}
              </Typography>

              {item.subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 0.5,
                    fontSize: "0.8rem",
                    display: { xs: "none", sm: "-webkit-box" },
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.subtitle}
                </Typography>
              )}

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 0.5,
                  fontSize: "0.75rem",
                }}
              >
                By {item.instructorName}
              </Typography>

              {/* Rating and Badges */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.5,
                  flexWrap: "wrap",
                }}
              >
                {item.ratings >= 4.5 && (
                  <Chip
                    label="Bestseller"
                    size="small"
                    sx={{
                      bgcolor: "#eceb98",
                      color: "#3d3c0a",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      height: 18,
                      borderRadius: 0.5,
                      mr: 0.5,
                      "& .MuiChip-label": { px: 0.75 },
                    }}
                  />
                )}
                {item.ratings != null && (
                  <>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: "#FAAF00",
                        fontSize: "0.8rem",
                        mr: 0.2,
                      }}
                    >
                      {item.ratings.toFixed(1)}
                    </Typography>
                    <Rating
                      value={item.ratings}
                      readOnly
                      size="small"
                      precision={0.1}
                      sx={{ fontSize: "0.875rem", color: "#faaf00" }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.75rem" }}
                    >
                      ({item.totalRatingStudent?.toLocaleString() || 0} ratings)
                    </Typography>
                  </>
                )}
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                {item.totalHours > 0 && `${item.totalHours} total hours`}
                {item.totalLectures > 0 && ` • ${item.totalLectures} lectures`}
                {item.level && ` • ${item.level}`}
              </Typography>
            </Box>

            {/* Actions Column */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "flex-start", md: "flex-start" },
                gap: 0.5,
                minWidth: { md: 120 },
              }}
            >
              <Button
                variant="text"
                sx={{
                  color: "brand.main",
                  textTransform: "none",
                  fontSize: "0.85rem",
                  padding: 0,
                  minWidth: 0,
                  justifyContent: "flex-start",
                  fontWeight: 500,
                  "&:hover": {
                    color: "brand.dark",
                    textDecoration: "underline",
                    backgroundColor: "transparent",
                  },
                }}
                onClick={handleRemove}
                disabled={loading}
                disableRipple
              >
                {loading ? <LoadingSpinner size={12} /> : "Remove"}
              </Button>

              <Button
                variant="text"
                sx={{
                  color: "brand.main",
                  textTransform: "none",
                  fontSize: "0.85rem",
                  padding: 0,
                  minWidth: 0,
                  justifyContent: "flex-start",
                  fontWeight: 500,
                  "&:hover": {
                    color: "brand.dark",
                    textDecoration: "underline",
                    backgroundColor: "transparent",
                  },
                }}
                onClick={handleSaveOrMove}
                disabled={loading}
                disableRipple
              >
                {loading ? (
                  <LoadingSpinner size={12} />
                ) : isSavedForLater ? (
                  "Move to Cart"
                ) : (
                  "Save for Later"
                )}
              </Button>
            </Box>

            {/* Price Column */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "flex-start", md: "flex-end" },
                minWidth: { md: 100 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    color: "text.primary",
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                  }}
                >
                  ${item.price.toFixed(2)}
                </Typography>
                {hasDiscount && (
                  <LocalOfferIcon sx={{ color: "brand.main", fontSize: "0.9rem" }} />
                )}
              </Box>
              {hasDiscount && (
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: "line-through",
                    color: "text.disabled",
                    fontSize: "0.8rem",
                    mt: 0.5,
                  }}
                >
                  ${item.originalPrice.toFixed(2)}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CartItem