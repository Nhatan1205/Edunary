import { Check,} from "@mui/icons-material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

import {
  Box,
  Popover,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const getArrowIcon = (transformOrigin) => {
  const { vertical, horizontal } = transformOrigin;

  // Arrow trỏ lên (khi popover ở phía dưới anchor)
  if (vertical === "top") {
    return <ArrowDropUpIcon sx={{ fontSize: 50, color: "background.paper" }} />;
  }

  // Arrow trỏ xuống (khi popover ở phía trên anchor)
  if (vertical === "bottom") {
    return (
      <ArrowDropDownIcon sx={{ fontSize: 50, color: "background.paper" }} />
    );
  }

  // Arrow trỏ trái (khi popover ở bên phải anchor)
  if (horizontal === "left") {
    return <ArrowLeftIcon sx={{ fontSize: 50, color: "background.paper" }} />;
  }

  // Arrow trỏ phải (khi popover ở bên trái anchor)
  if (horizontal === "right") {
    return <ArrowRightIcon sx={{ fontSize: 50, color: "background.paper" }} />;
  }

  return null;
};

const getArrowPosition = (transformOrigin) => {
  const { vertical, horizontal } = transformOrigin;

  // Arrow ở phía trên popover
  if (vertical === "top") {
    return {
      position: "absolute",
      top: -28,
      left:
        horizontal === "left" ? 16 : horizontal === "right" ? "auto" : "50%",
      right: horizontal === "right" ? 16 : "auto",
      transform: horizontal === "center" ? "translateX(-50%)" : "none",
      zIndex: 1,
    };
  }

  // Arrow ở phía dưới popover
  if (vertical === "bottom") {
    return {
      position: "absolute",
      bottom: -28,
      left:
        horizontal === "left" ? 16 : horizontal === "right" ? "auto" : "50%",
      right: horizontal === "right" ? 16 : "auto",
      transform: horizontal === "center" ? "translateX(-50%)" : "none",
      zIndex: 1,
    };
  }

  // Arrow ở bên trái popover
  if (horizontal === "left") {
    return {
      position: "absolute",
      left: -28,
      top: vertical === "top" ? 16 : vertical === "bottom" ? "auto" : "50%",
      bottom: vertical === "bottom" ? 16 : "auto",
      transform: vertical === "center" ? "translateY(-50%)" : "none",
      zIndex: 1,
    };
  }

  // Arrow ở bên phải popover
  if (horizontal === "right") {
    return {
      position: "absolute",
      right: -28,
      top: vertical === "top" ? 16 : vertical === "bottom" ? "auto" : "50%",
      bottom: vertical === "bottom" ? 16 : "auto",
      transform: vertical === "center" ? "translateY(-50%)" : "none",
      zIndex: 1,
    };
  }

  return {};
};

function CoursePopoverMin({
  open,
  anchorEl,
  course,
  onClose,
  onMouseEnter,
  onMouseLeave,
  anchorOrigin,
  transformOrigin,
}) {
  const { learningObjectives } = course;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      disableScrollLock={true}
      disableEnforceFocus={true}
      sx={{
        pointerEvents: "none",
        "& .MuiPopover-paper": {
          pointerEvents: "auto",
          maxWidth: isMobile ? "55vw" : 340,
          width: isMobile ? "55vw" : 320,
          maxHeight: 450,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 2,
          overflow: "visible",
          position: "relative",
        },
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disableRestoreFocus
    >
      <Box sx={getArrowPosition(transformOrigin)}>
        {getArrowIcon(transformOrigin)}
      </Box>
      <Box sx={{ p: 0 }}>
        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 1,
              fontSize: "1rem",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            What you'll learn
          </Typography>

          {/* Features List */}
          {learningObjectives && learningObjectives.length > 0 && (
            <div>
              {learningObjectives.slice(0, 4).map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Check
                    sx={{
                      color: "secondaryBrand.main",
                      fontSize: "1rem",
                      mr: 1,
                      mt: 0.1,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.primary",
                      fontSize: "0.85rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {item}
                  </Typography>
                </Box>
              ))}
            </div>
          )}

        </Box>
      </Box>
    </Popover>
  );
}

export default CoursePopoverMin;
