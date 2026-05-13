import { Box, Typography, Button } from "@mui/material";
import RatingTab from "../../../../components/rating-tab/RatingTab";
import OverviewTab from "./OverviewTab";
import NotesArea from "./NotesArea";
import QATab from "./qa-tab/QATab";
import { useParams, useSearchParams } from "react-router-dom";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "qa",       label: "Q&A" },
  { key: "reviews",  label: "Reviews" },
  { key: "notes",    label: "Notes" },
];

function CourseLearnTab({ courseId: courseIdProp, contentId, currentItem, currentTime, onSeek, onPauseVideo }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { courseId: courseIdParam } = useParams();
  const courseId = courseIdProp || courseIdParam;

  const active = searchParams.get("tab") || "overview";

  const handleTabChange = (key) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", key);
        return next;
      },
      { replace: true }
    );
  };

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
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "999px",
              px: 2.5,
              py: 0.7,
              color: active === tab.key ? "text.inverse" : "text.primary",
              bgcolor: active === tab.key ? "brand.main" : "transparent",
              boxShadow: active === tab.key ? 2 : "none",
              "&:hover": {
                bgcolor: active === tab.key ? "brand.dark" : "action.hover",
              },
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>

      {active === "overview" && (
        <Box sx={{ p: 4 }}>
          <OverviewTab courseId={courseId} />
        </Box>
      )}

      {active === "qa" && (
        <Box sx={{ p: 4 }}>
          <QATab courseId={courseId} currentItem={currentItem} />
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