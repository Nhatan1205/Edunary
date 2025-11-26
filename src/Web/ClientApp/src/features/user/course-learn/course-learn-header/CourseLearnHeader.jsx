import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
  Button,
  Skeleton,
  Popover,
} from "@mui/material";
import {
  Star,
} from "@mui/icons-material";
import { Link as RouterLink, useParams } from "react-router-dom"; 
import { Lightbulb, EmojiEvents, KeyboardArrowDown } from "@mui/icons-material";
import { useState } from "react";
import RatingPopup from "../../../../components/RatingPopup";
import { Link as RouterLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Lightbulb, EmojiEvents, KeyboardArrowDown } from "@mui/icons-material";
import useGetLearningHeader from "../../../../hooks/useGetLearningHeader";
import { useEffect, useState } from "react";

function CourseLearnHeader() {
  const { courseId } = useParams();
  const theme = useTheme();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { data: learningHeaderData, isLoading } = useGetLearningHeader(courseId);
  const [courseTitle, setCourseTitle] = useState("");
  const [progressData, setProgressData] = useState({ total: 0, completed: 0 });
  const [anchorEl, setAnchorEl] = useState(null);
  useEffect(() => {
    if (learningHeaderData) {
      setCourseTitle(learningHeaderData.title || "The Ultimate React Course 2025: React, Next.js, Redux & More");
      setProgressData({
        total: learningHeaderData.totalLectures || 0,
        completed: learningHeaderData.completedLectures || 0
      });
    }
  }, [learningHeaderData]);

  const handleClickProgress = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseProgress = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

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
        justifyContent: "space-between",
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
            flexShrink: 0,
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
              mr: 2,
            }}
          />
        )}

        <Box sx={{ display: { xs: "none", sm: "block" }, flex: 1 }}>
          {isLoading ? (
            <Skeleton
              variant="text"
              width={isMobile ? 100 : 400}
              height={30}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
          ) : (
            <Typography
              variant="subtitle1"
              noWrap
              sx={{
                fontSize: "16px",
                color: "#f7f9fa",
                fontWeight: 400,
                maxWidth: { sm: "300px", md: "500px", lg: "700px" },
              }}
            >
              {courseTitle}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            width={isMobile ? 40 : 140}
            height={40}
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: isMobile ? "50%" : 1,
            }}
          />
        ) : (
          <>
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
              aria-describedby={id}
              onClick={handleClickProgress}
              sx={{
                textTransform: "none",
                color: "#d1d7dc",
                "&:hover": {
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
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
                  mr: 1,
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

            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleCloseProgress}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    boxShadow: "0 2px 4px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.08)",
                    borderRadius: 0,
                    border: "1px solid #d1d7dc",
                    minWidth: "250px"
                  }
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: "#2d2f31",
                    mb: 0.5
                  }}
                >
                  {progressData.completed} of {progressData.total} complete.
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#6a6f73",
                    fontSize: "0.9rem"
                  }}
                >
                  {progressData.completed === progressData.total
                    ? "Click to get your certificate"
                    : "Finish course to get your certificate"}
                </Typography>
              </Box>
            </Popover>
          </>
        )}
      </Box>
    </Box>
  );
}

export default CourseLearnHeader;