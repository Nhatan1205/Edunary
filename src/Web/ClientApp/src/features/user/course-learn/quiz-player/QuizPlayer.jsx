import { useParams } from "react-router-dom";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import useGetQuizByItemId from "../../../../hooks/quiz-hooks/useGetQuizByItemId";
import CourseLearnTab from "../course-learn-tabs/CourseLearnTab";
import QuizPlayArea from "./QuizPlayArea";

// ─── Page wrapper (route entry) ───────────────────────────────────────────────
function QuizPlayer() {
  const { courseId, contentId } = useParams();
  const { data: quiz, isLoading, isError } = useGetQuizByItemId(
    courseId ? parseInt(courseId) : null,
    contentId
  );

  return (
    <Box>
      {/* Quiz area */}
      <Box sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
        {isLoading && (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        )}
        {isError && (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">Failed to load quiz.</Alert>
          </Box>
        )}
        {quiz && (
          <QuizPlayArea key={contentId} quiz={quiz} courseId={parseInt(courseId)} />
        )}
        {!isLoading && !isError && !quiz && (
          <Box sx={{ p: 5, textAlign: "center" }}>
            <Typography color="text.secondary">No quiz found for this item.</Typography>
          </Box>
        )}
      </Box>

      {/* Tabs area (same as video page) */}
      <CourseLearnTab courseId={parseInt(courseId)} contentId={contentId} />
    </Box>
  );
}

export default QuizPlayer;