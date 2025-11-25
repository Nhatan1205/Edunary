import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import RatingTab from "../../../../components/rating-tab/RatingTab";
import { useParams } from "react-router-dom";

function CourseLearnTab() {
  const [active, setActive] = useState("overview");
  const { courseId } = useParams();

  return (
    <Box sx={{ p: 3, bgcolor: "white", minHeight: "500px" }}>
      <Box sx={{ display: "flex", gap: 3, borderBottom: "1px solid #ddd", pb: 1, mb: 2 }}>
        <Button color={active === "overview" ? "primary" : "inherit"} onClick={() => setActive("overview")}>
          Overview
        </Button>
        <Button color={active === "reviews" ? "primary" : "inherit"} onClick={() => setActive("reviews")}>
          Reviews
        </Button>
        <Button color={active === "notes" ? "primary" : "inherit"} onClick={() => setActive("notes")}>
          Notes
        </Button>
      </Box>

      {active === "overview" && (
        <Box sx={{ p: 4, bgcolor: "#f0f2f5", borderRadius: 2 }}>
          <Typography>
            <strong>Overview:</strong>
            <br /> Đây là nơi hiển thị thông tin tổng quan của khóa học.
          </Typography>
        </Box>
      )}

      {active === "reviews" && (
        <Box>
          <RatingTab courseId={courseId} />
        </Box>
      )}

      {active === "notes" && (
        <Box sx={{ p: 4, bgcolor: "#f0f2f5", borderRadius: 2 }}>
          <Typography>Notes area (placeholder)</Typography>
        </Box>
      )}
    </Box>
  );
}

export default CourseLearnTab;