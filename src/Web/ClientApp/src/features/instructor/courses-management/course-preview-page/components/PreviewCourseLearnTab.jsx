import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";

function PreviewCourseLearnTab() {
  const [active, setActive] = useState("overview");

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", minHeight: "500px" }}>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 1.5,
          mb: 2,
        }}
      >
        <Button
          onClick={() => setActive("overview")}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "999px",
            px: 2.5,
            py: 0.7,
            color: active === "overview" ? "text.inverse" : "text.primary",
            bgcolor: active === "overview" ? "brand.main" : "transparent",
            boxShadow: active === "overview" ? 2 : "none",
            "&:hover": {
              bgcolor: active === "overview" ? "brand.dark" : "action.hover",
            },
          }}
        >
          Overview
        </Button>
        <Button
          onClick={() => setActive("reviews")}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "999px",
            px: 2.5,
            py: 0.7,
            color: active === "reviews" ? "text.inverse" : "text.primary",
            bgcolor: active === "reviews" ? "brand.main" : "transparent",
            boxShadow: active === "reviews" ? 2 : "none",
            "&:hover": {
              bgcolor: active === "reviews" ? "brand.dark" : "action.hover",
            },
          }}
        >
          Reviews
        </Button>
        <Button
          onClick={() => setActive("notes")}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "999px",
            px: 2.5,
            py: 0.7,
            color: active === "notes" ? "text.inverse" : "text.primary",
            bgcolor: active === "notes" ? "brand.main" : "transparent",
            boxShadow: active === "notes" ? 2 : "none",
            "&:hover": {
              bgcolor: active === "notes" ? "brand.dark" : "action.hover",
            },
          }}
        >
          Notes
        </Button>
      </Box>

      {active === "overview" && (
        <Box sx={{ p: 4 }}>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Overview data will be displayed here for students. (Preview Mode)
            </Typography>
        </Box>
      )}

      {active === "reviews" && (
        <Box sx={{ p: 4 }}>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Student reviews will be displayed here. (Preview Mode)
          </Typography>
        </Box>
      )}

      {active === "notes" && (
        <Box sx={{ p: 4, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Notes area. (Preview Mode)
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default PreviewCourseLearnTab;