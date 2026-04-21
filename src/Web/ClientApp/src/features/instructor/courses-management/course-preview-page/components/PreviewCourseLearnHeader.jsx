import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Button, useTheme, useMediaQuery, Divider, Popover, Dialog, DialogContent, DialogTitle, IconButton, Rating, TextField } from "@mui/material";
import { Lightbulb, EmojiEvents, KeyboardArrowDown, Star, Close as CloseIcon } from "@mui/icons-material";

export default function PreviewCourseLearnHeader({ courseTitle, courseContents }) {
  const theme = useTheme();
  const { courseId } = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [progressData, setProgressData] = useState({ total: 0, completed: 0 });
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    let totalItems = 0;
    (courseContents || []).forEach(section => {
      totalItems += (section.items || []).length;
    });
    setProgressData({ total: totalItems, completed: 0 });
  }, [courseContents]);

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
        height: { xs: "64px", md: "72px" },
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        alignItems: "center",
        px: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: 3,
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        "@keyframes headerFloatOne": {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0px)" },
        },
        "@keyframes headerFloatTwo": {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(8px)" },
          "100%": { transform: "translateY(0px)" },
        },
      }}
    >
      {/* Background decorations */}
      <Box sx={{ position: "absolute", inset: 0, bgcolor: "brand.main", opacity: 0.12, pointerEvents: "none" }} />
      <Box
        sx={{
          position: "absolute", top: "-60%", right: "-10%", width: { xs: "260px", md: "360px" }, height: { xs: "260px", md: "360px" },
          borderRadius: "50%", bgcolor: "brand.main", opacity: 0.2, filter: "blur(8px)",
          animation: "headerFloatOne 6s ease-in-out infinite", pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute", bottom: "-70%", left: "-12%", width: { xs: "240px", md: "340px" }, height: { xs: "240px", md: "340px" },
          borderRadius: "50%", bgcolor: "brand.dark", opacity: 0.18, filter: "blur(8px)",
          animation: "headerFloatTwo 7s ease-in-out infinite", pointerEvents: "none",
        }}
      />

      <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", textDecoration: "none", mr: 2, flexShrink: 0 }}>
          <Lightbulb sx={{ color: "brand.main", width: 32, height: 32, borderRadius: "8px", bgcolor: "brand.lighter", p: "4px" }} />
          {!isMobile && (
            <Typography variant="h4" sx={{ fontSize: "22px", fontWeight: 800, color: "brand.main", ml: 1, letterSpacing: "0.2px", lineHeight: 1, display: "flex", alignItems: "center" }}>
              Edunary
            </Typography>
          )}
        </Box>

        {!isMobile && <Divider orientation="vertical" flexItem sx={{ bgcolor: "divider", my: 1.5, mr: 2 }} />}

        <Box sx={{ display: { xs: "none", sm: "block" }, flex: 1 }}>
            <Typography variant="subtitle1" noWrap sx={{ fontSize: "16px", color: "text.main", fontWeight: 600, maxWidth: { sm: "300px", md: "500px", lg: "700px" }, lineHeight: 1.2, display: "flex", alignItems: "center" }}>
              {`${courseTitle} [Preview Mode]`}
            </Typography>
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0, zIndex: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          sx={{
            textTransform: "none",
            color: "text.inverse",
            bgcolor: "brand.main",
            borderRadius: "12px",
            px: 2,
            py: 0.8,
            boxShadow: 2,
            "&:hover": {
              color: "text.inverse",
              bgcolor: "brand.dark",
              boxShadow: 3,
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

        <Dialog 
          open={isPopupOpen} 
          onClose={() => setIsPopupOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              padding: 2,
              maxWidth: '500px'
            }
          }}
        >
          <DialogContent>
            {/* Header Row: Back button and Close Icon */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Button
                onClick={() => setIsPopupOpen(false)}
                sx={{
                  textTransform: 'none',
                  color: 'brand.main',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  minWidth: 0,
                  padding: 0
                }}
              >
                Back
              </Button>
              <IconButton size="small" onClick={() => setIsPopupOpen(false)} aria-label="close">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Why did you leave this rating?
              </Typography>
              
              <Typography variant="body2" sx={{ color: "warning.main", fontWeight: 500, mb: 1 }}>
                (Preview Mode - Submitting ratings is disabled)
              </Typography>

              {/* Star Rating - Editable */}
              <Box mt={1} mb={3}>
                <Rating
                  name="course-rating-preview"
                  value={0}
                  size="large"
                  sx={{
                    fontSize: '3rem'
                  }}
                />
              </Box>

              {/* Text Area */}
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Tell us about your own personal experience taking this course. Was it a good match for you?"
                variant="outlined"
                value=""
                sx={{
                  fontSize: '0.9rem'
                }}
              />
              
              <Box sx={{ width: '100%', mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                  0/500
                </Typography>
              </Box>

              {/* Footer Action Button */}
              <Box display="flex" justifyContent="flex-end" width="100%" mt={2}>
                <Button
                  variant="contained"
                  disabled
                  sx={{
                    backgroundColor: 'brand.main',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '10px 24px',
                    '&.Mui-disabled': {
                      backgroundColor: 'action.disabledBackground',
                    }
                  }}
                >
                  Save and Continue
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        <Button
          aria-describedby={id}
          onClick={handleClickProgress}
          sx={{
            textTransform: "none",
            color: "text.primary",
            ml: 1,
            borderRadius: "12px",
            px: 1.6,
            py: 0.6,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            "&:hover": {
              color: "text.primary",
              bgcolor: "action.hover",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "brand.lighter",
              color: "brand.dark",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "50%",
              width: 30,
              height: 30,
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
                boxShadow: 6,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                minWidth: "250px",
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
                color: "text.primary",
                mb: 0.5
              }}
            >
              {progressData.completed} of {progressData.total} complete.
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.9rem"
              }}
            >
              {progressData.completed === progressData.total
                ? "Click to get your certificate"
                : "Finish course to get your certificate"}
            </Typography>
          </Box>
        </Popover>

        <Button variant="contained" size="small" onClick={() => {
          window.close();
        }} sx={{ ml: 1, px: 2, py: "6px", textTransform: "none", fontWeight: 600, boxShadow: 2, borderRadius: "8px", bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}>
          Exit Preview
        </Button>
      </Box>
    </Box>
  );
}