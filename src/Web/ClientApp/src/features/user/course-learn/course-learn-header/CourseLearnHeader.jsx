import { 
  Box, 
  Typography,
  useMediaQuery, 
  useTheme,
  Divider,
  Button
} from "@mui/material";
import {
  Star,
} from "@mui/icons-material";
import { Link as RouterLink, useParams } from "react-router-dom"; 
import { Lightbulb, EmojiEvents, KeyboardArrowDown } from "@mui/icons-material";
import { useState } from "react";
import RatingPopup from "../../../../components/RatingPopup";

function CourseLearnHeader() {
  const { courseId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Đổi thành md để ẩn title sớm hơn trên tablet nhỏ
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // Sample data
  const courseTitle = "The Ultimate React Course 2025: React, Next.js, Redux & More";

  return (
    <Box 
      sx={{ 
        height: "64px", 
        bgcolor: "#2d2f31",
        color: "white",
        display: "flex", 
        alignItems: "center", 
        px: 2,
        borderBottom: "1px solid #3e4143",
        justifyContent: "space-between" 
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            mr: 2,
            flexShrink: 0 
          }}
        >
          <Lightbulb
            sx={{
              color: "brand.main", 
              width: 32,
              height: 32,
              borderRadius: "8px",
            }}
          />
          {!isMobile && (
            <Typography
              variant="h4"
              sx={{
                fontSize: "24px", 
                fontWeight: "bold",
                color: "white",
                ml: 1,
              }}
            >
              Edunary
            </Typography>
          )}
        </Box>

        {!isMobile && (
          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ 
              bgcolor: "#6a6f73", 
              my: 1.5, 
              mr: 2 
            }} 
          />
        )}

        <Typography
          variant="subtitle1"
          noWrap 
          sx={{
            fontSize: "16px",
            color: "#f7f9fa",
            fontWeight: 400,
            display: { xs: "none", sm: "block" }, 
            maxWidth: { sm: "300px", md: "500px", lg: "700px" }
          }}
        >
          {courseTitle}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
        <Button
          sx={{
            textTransform: "none",
            color: "#d1d7dc", 
            "&:hover": {
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)"
            }
          }}
          startIcon={<Star />}
          onClick={() => setIsPopupOpen(true)}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {!isMobile && (
              <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                Leave a rating
              </Typography>
            )}
          </Box>
        </Button>

        <RatingPopup 
          open={isPopupOpen} 
          onClose={() => setIsPopupOpen(false)}
          courseId={courseId}
        />

        <Button
          sx={{
            textTransform: "none",
            color: "#d1d7dc", 
            "&:hover": {
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)"
            }
          }}
        >
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              border: "2px solid #d1d7dc", 
              borderRadius: "50%",
              width: 32,
              height: 32,
              mr: 1
            }}
          >
            <EmojiEvents sx={{ fontSize: 18 }} />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            {!isMobile && (
              <Typography sx={{ fontSize: "14px", fontWeight: 500 }}>
                Your progress
              </Typography>
            )}
            <KeyboardArrowDown sx={{ ml: 0.5 }} />
          </Box>
        </Button>
      </Box>
    </Box>
  );
}

export default CourseLearnHeader;