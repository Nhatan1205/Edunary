import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import RatingTab from "../../../../components/rating-tab/RatingTab";
import OverviewTab from "./OverviewTab";
import NotesArea from "./NotesArea";
import QATab from "./qa-tab/QATab";
import { useParams } from "react-router-dom";

function CourseLearnTab({ courseId: courseIdProp, contentId, currentItem, currentTime, onSeek, onPauseVideo }) {
  const [active, setActive] = useState("overview");
  const { courseId: courseIdParam } = useParams();
  const courseId = courseIdProp || courseIdParam;

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
          onClick={() => setActive("qa")}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "999px",
            px: 2.5,
            py: 0.7,
            color: active === "qa" ? "text.inverse" : "text.primary",
            bgcolor: active === "qa" ? "brand.main" : "transparent",
            boxShadow: active === "qa" ? 2 : "none",
            "&:hover": {
              bgcolor: active === "qa" ? "brand.dark" : "action.hover",
            },
          }}
        >
          Q&amp;A
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
          {/* <Typography>
            <strong>Overview:</strong>
            <br /> Đây là nơi hiển thị thông tin tổng quan của khóa học.
          </Typography> */}
          <OverviewTab courseId={courseId} />
        </Box>
      )}
      {active === "qa" && (
        <Box sx={{ p: 4 }}>
          <QATab
            courseId={courseId}
            currentItem={currentItem}
          />
        </Box>
      )}

      {active === "reviews" && (
        <Box>
          <RatingTab courseId={courseId} />
        </Box>
      )}

      {active === "notes" && (
        currentItem?.contentType === "video" ? (
          <NotesArea
            courseId={courseId}
            contentId={contentId}
            currentItem={currentItem}
            currentTime={currentTime}
            onSeek={onSeek}
            onPauseVideo={onPauseVideo}
          />
        ) : (
          <Box sx={{ p: 4, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography>Notes are available for video lectures only.</Typography>
          </Box>
        )
      )}
    </Box>
  );
}

export default CourseLearnTab;