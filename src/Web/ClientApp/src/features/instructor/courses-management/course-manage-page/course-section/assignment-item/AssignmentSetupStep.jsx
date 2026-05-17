import { useState } from "react";
import {
  Box, IconButton, Typography, Stack, Button, CircularProgress,
  List, ListItemButton, ListItemText, Chip,
} from "@mui/material";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  SwapHoriz as SwapHorizIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import useGetAssignmentsByCourse from "../../../../../../hooks/assignment-hooks/useGetAssignmentsByCourse";
import useLinkAssignmentToItem from "../../../../../../hooks/assignment-hooks/useLinkAssignmentToItem";

function AssignmentSetupStep({ item, courseId, onUpdate, onModeChange, sections }) {
  const [mode, setMode] = useState(null); // null | "choose"

  const { data: courseAssignments = [], isLoading } = useGetAssignmentsByCourse(
    mode === "choose" ? courseId : null
  );
  const linkMutation = useLinkAssignmentToItem();

  const usedAssignmentIds = sections.flatMap((sec) =>
    sec.items.map((i) => i.assignmentId).filter((id) => id && id > 0)
  );
  const availableAssignments = courseAssignments.filter(
    (a) => !usedAssignmentIds.includes(a.id)
  );

  const handlePickExisting = async (assignment) => {
    await linkMutation.mutateAsync({
      assignmentId: assignment.id,
      courseId,
      newItemId: item.itemId,
    });
    onUpdate(item.itemId, {
      assignmentId: assignment.id,
      description: assignment.description ?? "",
    });
  };

  if (mode === null) {
    return (
      <Box sx={{ py: 3, px: 1 }}>
        <Typography variant="body2" color="text.secondary" mb={2} textAlign="center">
          How would you like to set up this assignment?
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => onModeChange("create")}
            sx={{
              bgcolor: "brand.main",
              "&:hover": { bgcolor: "brand.dark" },
              fontWeight: 600,
              px: 3,
            }}
          >
            Create New Assignment
          </Button>
          <Button
            variant="outlined"
            startIcon={<SwapHorizIcon />}
            onClick={() => setMode("choose")}
            sx={{
              borderColor: "brand.main",
              color: "brand.main",
              "&:hover": { borderColor: "brand.dark", bgcolor: "brand.lighter" },
              fontWeight: 600,
              px: 3,
            }}
          >
            Choose Existing
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2, px: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <IconButton size="small" onClick={() => setMode(null)} sx={{ color: "text.secondary" }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="subtitle2" fontWeight={700}>
          Choose an existing assignment from this course
        </Typography>
      </Stack>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!isLoading && availableAssignments.length === 0 && (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Typography color="text.secondary" variant="body2">
            No recoverable assignments found.
          </Typography>
          <Typography color="text.secondary" variant="caption">
            These are assignments that were saved but the course wasn't saved afterwards.
          </Typography>
        </Box>
      )}

      {!isLoading && availableAssignments.length > 0 && (
        <List disablePadding>
          {availableAssignments.map((assignment) => (
            <ListItemButton
              key={assignment.id}
              disabled={linkMutation.isPending}
              onClick={() => handlePickExisting(assignment)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                border: "1px solid",
                borderColor: "divider",
                "&:hover": { borderColor: "brand.main", bgcolor: "brand.lighter" },
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600}>
                    {assignment.title || `Assignment #${assignment.id}`}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {assignment.estimatedDurationMinutes} min · {assignment.questionCount} question
                    {assignment.questionCount !== 1 ? "s" : ""}
                  </Typography>
                }
              />
              <Chip
                label={linkMutation.isPending ? "Linking..." : "Use this"}
                size="small"
                color="primary"
                variant="outlined"
                disabled={linkMutation.isPending}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}

export default AssignmentSetupStep;
