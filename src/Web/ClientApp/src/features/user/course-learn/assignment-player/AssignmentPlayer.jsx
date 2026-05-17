import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import useGetAssignmentByItemId from "../../../../hooks/assignment-hooks/useGetAssignmentByItemId";
import useUpdateCPByItemId from "../../../../hooks/course-progress-hooks/useUpdateCPByItemId";
import useGetCPByItemId from "../../../../hooks/course-progress-hooks/useGetCPByItemId";
import CourseLearnTab from "../course-learn-tabs/CourseLearnTab";
import AssignmentPlayArea from "./AssignmentPlayArea";

function AssignmentPlayer()
{
  const { courseId, contentId } = useParams();
  const { data: assignment, isLoading, isError } = useGetAssignmentByItemId(
    courseId ? parseInt(courseId) : null,
    contentId
  );
  const { data: itemData } = useGetCPByItemId(contentId, courseId ? parseInt(courseId) : null);
  const updateCPMutation = useUpdateCPByItemId();
  const navigate = useNavigate();

  const handleNavigateNext = () =>
  {
    const nextItem = itemData?.navigation?.next;
    if (nextItem)
    {
      const routeType = nextItem.type === "quiz" ? "quiz"
        : nextItem.type === "assignment" ? "assignment"
        : "lecture";
      navigate(`/course/${courseId}/learn/${routeType}/${nextItem.itemId}`);
    }
    else
    {
      navigate(`/course/${courseId}`);
    }
  };

  useEffect(() =>
  {
    if (courseId && contentId)
    {
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
      <Box sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}>
        {isLoading && (
          <Box sx={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        )}
        {isError && (
          <Box sx={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center", p: 4 }}>
            <Alert severity="error">Failed to load assignment.</Alert>
          </Box>
        )}
        {assignment && (
          <AssignmentPlayArea
            key={contentId}
            assignment={assignment}
            courseId={parseInt(courseId)}
            onDone={handleNavigateNext}
          />
        )}
        {!isLoading && !isError && !assignment && (
          <Box sx={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography color="text.secondary">No assignment found for this item.</Typography>
          </Box>
        )}
      </Box>

      <CourseLearnTab courseId={parseInt(courseId)} contentId={contentId} />
    </Box>
  );
}

export default AssignmentPlayer;
