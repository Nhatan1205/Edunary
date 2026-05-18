import { useState } from "react";
import {
  Box, IconButton, Typography, Stack, Button, CircularProgress, List,
  ListItemButton, ListItemText, Chip
} from "@mui/material";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  SwapHoriz as SwapHorizIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import useGetQuizzesByCourse from "../../../../../../hooks/quiz-hooks/useGetQuizzesByCourse";
import useLinkQuizToItem from "../../../../../../hooks/quiz-hooks/useLinkQuizToItem";

function QuizSetupStep({ item, courseId, onUpdate, onModeChange, sections }) {
  const [mode, setMode] = useState(null); // null | "choose"
  const { data: courseQuizzes = [], isLoading } = useGetQuizzesByCourse(
    mode === "choose" ? courseId : null
  );
  const linkMutation = useLinkQuizToItem();

  const usedQuizIds = sections.flatMap((sec) =>
    sec.items.map((i) => i.quizId).filter((id) => id && id > 0)
  );
  const availableQuizzes = courseQuizzes.filter(
    (q) => !usedQuizIds.includes(q.id)
  );

  const handlePickExisting = async (quiz) => {
    try {
      await linkMutation.mutateAsync({
        quizId: quiz.id,
        courseId,
        newItemId: item.itemId,
        relatedItemId: null,
      });
      onUpdate(item.itemId, {
        quizId: quiz.id,
        description: quiz.description ?? "",
      });
    } catch { };

  };

  if (mode === null) {
    return (
      <Box sx={{ py: 3, px: 1 }}>
        <Typography variant="body2" color="text.secondary" mb={2} textAlign="center">
          How would you like to set up this quiz?
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
            Create New Quiz
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
            Choose Existing Quiz
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
          Choose an existing quiz from this course
        </Typography>
      </Stack>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!isLoading && availableQuizzes.length === 0 && (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Typography color="text.secondary" variant="body2">
            No recoverable quizzes found.
          </Typography>
          <Typography color="text.secondary" variant="caption">
            These are quizzes that were saved but the course wasn't saved afterwards.
          </Typography>
        </Box>
      )}

      {!isLoading && availableQuizzes.length > 0 && (
        <List disablePadding>
          {availableQuizzes.map((quiz) => (
            <ListItemButton
              key={quiz.id}
              disabled={linkMutation.isPending}
              onClick={() => handlePickExisting(quiz)}
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
                    {quiz.title || `Quiz #${quiz.id}`}
                  </Typography>
                }
                secondary={quiz.description ? quiz.description.substring(0, 80) : "No description"}
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

export default QuizSetupStep;
