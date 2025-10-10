import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useRef } from "react";
import { Col } from "reactstrap";
import CoursePopover from "../../../../components/course-popover/CoursePopover";
import { usePopover } from "../../../../context/PopoverContext";
import { getPopoverOrigin } from "../../../../utils/getPopoverOrigin";
import DefaultImage from "../../../../assets/images/default.jpg";
import { Link as RouterLink } from "react-router";

function CourseCard({ course }) {
  const { id, imageUrl, title, price, level } = course;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const cardRef = useRef(null);

  const {
    anchorEl,
    isPopoverActive,
    handleMouseEnter,
    handleMouseLeave,
    handlePopoverMouseEnter,
    handlePopoverMouseLeave,
  } = usePopover();

  const isThisPopoverActive = isPopoverActive(id);
  const open = Boolean(anchorEl) && isThisPopoverActive;
  // setting popup hover

  function onMouseEnter(event) {
    handleMouseEnter(id, cardRef.current || event.currentTarget);
  }

  const popoverOrigins = getPopoverOrigin(isMobile, cardRef);

  const handleAddToCart = (course) => {
    // console.log("Adding to cart:", course.title);
    // Implement your add to cart logic here
  };

  const handleToggleFavorite = (course) => {
    // console.log("Toggle favorite:", course.title);
    // Implement your toggle favorite logic here
  };

  return (
    <Col xs={6} md={4} lg={3} className="mb-4">
      <Card
        component={RouterLink}
        to={`/course/${id}`}
        ref={cardRef}
        onMouseEnter={onMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          height: "320px",
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform 0.2s ease-in-out",
          bgcolor: "background.default",
          boxShadow: "none",
          textDecoration: "none",
          "&:hover": {
            transform: "translateY(-1px)",
            // boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            // bgcolor: "background.alt",
            "& .MuiCardMedia-root": {
              filter: "brightness(0.5)", // chỉ ảnh tối lại
            },
          },
        }}
      >
        <CardMedia
          component="img"
          height="160"
          image={imageUrl ? imageUrl : DefaultImage}
          alt={title}
          sx={{
            objectFit: "cover",
            filter: "brightness(0.8)",
            borderRadius: 2,
            flexShrink: 0,
            transition: "filter 0.3s ease, transform 0.3s ease",
          }}
        />

        {/* Level Badge */}
        <Chip
          label={level}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(255,255,255,0.9)",
            color: "#666",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        />

        <CardContent
          sx={{
            p: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontSize: "0.95rem",
              fontWeight: 600,
              lineHeight: 1.3,
              mb: 1,
              color: "#333",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              height: "2.6em",
            }}
          >
            {title}
          </Typography>
          {/* {instructor && (
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontSize: "0.8rem",
                mb: 1,
              }}
            >
              {instructor}
            </Typography>
          )} */}
          {/* Rating */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" sx={{ color: "#FFA726", mr: 0.5 }}>
              ★★★★★
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#666", fontSize: "0.8rem" }}
            >
              4.8
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#333",
                fontSize: "1.1rem",
              }}
            >
              ${price}
            </Typography>
            {price && (
              <Typography
                variant="body2"
                sx={{
                  textDecoration: "line-through",
                  color: "#999",
                  fontSize: "0.9rem",
                }}
              >
                ${price}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      <CoursePopover
        open={open}
        anchorEl={anchorEl}
        course={course}
        onMouseEnter={handlePopoverMouseEnter}
        onMouseLeave={handlePopoverMouseLeave}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
        anchorOrigin={popoverOrigins.anchorOrigin}
        transformOrigin={popoverOrigins.transformOrigin}
      />
    </Col>
  );
}

export default CourseCard;
