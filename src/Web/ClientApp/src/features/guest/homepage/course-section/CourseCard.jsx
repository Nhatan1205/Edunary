import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  useTheme,
  useMediaQuery,
  Rating,
} from "@mui/material";
import { useRef } from "react";
import { Col } from "reactstrap";
import CoursePopover from "../../../../components/course-popover/CoursePopover";
import { usePopover } from "../../../../context/PopoverContext";
import { getPopoverOrigin } from "../../../../utils/getPopoverOrigin";
import DefaultImage from "../../../../assets/images/default.jpg";
import MetaChip from '../../../../components/MetaChip';
import { Link as RouterLink, useNavigate } from "react-router";
import { useAuth } from "../../../../context/AuthContext";
import { useAddToCart } from "../../../../hooks/useAddToCart";

function CourseCard({ course }) {
  const { id, imageUrl, title, price, level, ratings, instructorName, totalStudents } = course;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, loading: addingToCart } = useAddToCart();

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

  const handleAddToCart = async (course) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await addToCart(course.id);
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
            "& .MuiCardMedia-root": {
              filter: "brightness(0.5)",
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
            borderRadius: 1,
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
            py: 2,
            px: 0,
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
              mb: 0.5,
              color: "#333",
              wordBreak: "break-word",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>
          {instructorName && (
            <Typography
              variant="body2"
              sx={{
                color: "#595C73",
                fontSize: "0.8rem",
                mb: 0.5,
                whiteSpace: "nowrap",     
                overflow: "hidden",        
                textOverflow: "ellipsis",  
                display: "block",
              }}
            >
              {instructorName}
            </Typography>
          )}
          {/* Rating */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Typography
              variant="body2"
              sx={{ 
                fontWeight: 600,
                color: "#FAAF00",
                fontSize: "0.8rem",
                mr: 0.5,
                mt: 0.2 
              }}
            >
              {ratings?.toFixed(1) || "0.0"}
            </Typography>
            
            <Rating 
              name="read-only" 
              value={ratings || 0} 
              precision={0.5}
              readOnly 
              size="small"
              sx={{
                fontSize: "1rem", 
                color: "#FAAF00",
                "& .MuiRating-iconEmpty": {
                  color: "#faaf00",
                  opacity: 0.4, 
                }
              }}
            />
          </Box>

          {/* Price */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1,mb: 0.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#333",
                fontSize: "1.1rem",
              }}
            >
              {price === 0 ? "Free" : `$${price}`}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {totalStudents > 1 && (
              <MetaChip
                  label={"Bestseller"}
                  backgroundColor={"#eceb98"}
                  color={"#3d3c0a"}
                  borderColor={"#eceb98"}
              />
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
        addingToCart={addingToCart}
      />
    </Col>
  );
}

export default CourseCard;
