import React from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import useGetAssignmentByItemId from "../../../../../../hooks/assignment-hooks/useGetAssignmentByItemId";
import PreviewAssignmentPlayArea from "./PreviewAssignmentPlayArea";

export default function PreviewAssignmentPlayer({ courseId, contentId }) {
  const { data: assignment, isLoading, isError } = useGetAssignmentByItemId(
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
          <Alert severity="error">Failed to load assignment.</Alert>
        </Box>
      )}
      {assignment && (
        <PreviewAssignmentPlayArea key={contentId} assignment={assignment} courseId={parseInt(courseId)} />
      )}
      {!isLoading && !isError && !assignment && (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography color="text.secondary">No assignment found for this item.</Typography>
        </Box>
      )}
    </Box>
  );
}
