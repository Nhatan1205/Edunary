import React from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import useGetQuizByItemId from "../../../../../hooks/quiz-hooks/useGetQuizByItemId";
import PreviewQuizPlayArea from "./PreviewQuizPlayArea";

export default function PreviewQuizPlayer({ courseId, contentId }) {
  const { data: quiz, isLoading, isError } = useGetQuizByItemId(
    courseId ? parseInt(courseId) : null,
    contentId
  );

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
      {isLoading && (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      )}
      {isError && (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
          <Alert severity="error">Failed to load quiz.</Alert>
        </Box>
      )}
      {quiz && (
        <PreviewQuizPlayArea key={contentId} quiz={quiz} courseId={parseInt(courseId)} />
      )}
      {!isLoading && !isError && !quiz && (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography color="text.secondary">No quiz found for this item.</Typography>
        </Box>
      )}
    </Box>
  );
}
