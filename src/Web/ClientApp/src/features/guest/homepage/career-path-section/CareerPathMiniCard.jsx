import { Box, Typography, IconButton } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Link as RouterLink } from "react-router";

function CareerPathMiniCard({ path }) {
  return (
    <Box
      component={RouterLink}
      to={`/career-paths/${path.id}`}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        bgcolor: "background.paper",
        border: "1.5px solid",
        borderColor: "divider",
        borderRadius: "14px",
        px: { xs: 2, md: 2.5 },
        py: 2,
        cursor: "pointer",
        textDecoration: "none",
        transition: "border-color 0.2s ease, background-color 0.2s ease",
        "&:hover": {
          borderColor: "brand.main",
          bgcolor: "background.muted",
          "& .career-arrow": {
            bgcolor: "brand.main",
            color: "text.inverse",
            borderColor: "brand.main",
          },
        },
      }}
    >
      {/* Left: topic + title */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Topic chip */}
        {path.topicTitle && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              fontWeight: 600,
              fontSize: "0.72rem",
              color: "text.tertiary",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              mb: 0.5,
            }}
          >
            {path.topicTitle}
          </Typography>
        )}

        {/* Title */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: "brand.dark",
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {path.title}
        </Typography>
      </Box>

      {/* Right: arrow button */}
      <IconButton
        className="career-arrow"
        size="small"
        sx={{
          border: "1.5px solid",
          borderColor: "divider",
          borderRadius: "10px",
          width: 38,
          height: 38,
          flexShrink: 0,
          color: "brand.dark",
          transition: "all 0.25s ease",
        }}
      >
        <ArrowForwardIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}

export default CareerPathMiniCard;
