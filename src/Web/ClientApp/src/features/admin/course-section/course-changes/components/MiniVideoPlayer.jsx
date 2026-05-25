import { Box, Typography } from "@mui/material";
import MovieIcon from "@mui/icons-material/Movie";

export default function MiniVideoPlayer({ url, title }) {
  if (!url) return null;
  return (
    <Box sx={{ mt: 1, width: "100%", maxWidth: 360 }}>
      <video
        src={url}
        controls
        style={{
          width: "100%",
          borderRadius: "8px",
          backgroundColor: "#000",
          display: "block",
          aspectRatio: "16/9",
          border: "1px solid #E5E7EB",
        }}
      />
      {title && (
        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, color: "text.secondary", fontWeight: 500 }}>
          <MovieIcon sx={{ fontSize: 13, color: "text.tertiary" }} />
          {title}
        </Typography>
      )}
    </Box>
  );
}
