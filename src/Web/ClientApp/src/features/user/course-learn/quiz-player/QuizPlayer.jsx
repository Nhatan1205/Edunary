import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import useGetQuizByItemId from "../../../../hooks/quiz-hooks/useGetQuizByItemId";
import useUpdateCPByItemId from "../../../../hooks/course-progress-hooks/useUpdateCPByItemId";
import useGetCPByItemId from "../../../../hooks/course-progress-hooks/useGetCPByItemId";
import CourseLearnTab from "../course-learn-tabs/CourseLearnTab";
import QuizPlayArea from "./QuizPlayArea";

// ─── Page wrapper (route entry) ───────────────────────────────────────────────
function QuizPlayer() {
  const { courseId, contentId } = useParams();
  const { data: quiz, isLoading, isError } = useGetQuizByItemId(
    courseId ? parseInt(courseId) : null,
    contentId
  );
  const { data: itemData } = useGetCPByItemId(contentId, courseId ? parseInt(courseId) : null);
  const updateCPMutation = useUpdateCPByItemId();
  const navigate = useNavigate();

  const handleNavigateNext = () => {
    const nextItem = itemData?.navigation?.next;
    if (nextItem) {
      const routeType = nextItem.type === "quiz" ? "quiz" : "lecture";
      navigate(`/course/${courseId}/learn/${routeType}/${nextItem.itemId}`);
    } else {
      navigate(`/course/${courseId}`);
    }
  };

  // Update lastAccessedItemId whenever the user navigates to a quiz item.
  // isCompleted: false ensures we never downgrade an already-completed item.
  useEffect(() => {
    if (courseId && contentId) {
      updateCPMutation.mutate({
        courseId: parseInt(courseId),
        itemId: contentId,
        isCompleted: false,
        lastPosition: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, courseId]);

  return (
    <Box>
      {/* Quiz area */}
      <Box sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
        {isLoading && (
          <Box sx={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        )}
        {isError && (
          <Box sx={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
            <Alert severity="error">Failed to load quiz.</Alert>
          </Box>
        )}
        {quiz && (
          <QuizPlayArea key={contentId} quiz={quiz} courseId={parseInt(courseId)} onDone={handleNavigateNext} />
        )}
        {!isLoading && !isError && !quiz && (
          <Box sx={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography color="text.secondary">No quiz found for this item.</Typography>
          </Box>
        )}
      </Box>

      {/* Tabs area */}
      <CourseLearnTab courseId={parseInt(courseId)} contentId={contentId} />
    </Box>
  );
}

export default QuizPlayer;