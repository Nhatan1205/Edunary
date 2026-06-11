import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, Typography,
  Chip, CircularProgress, Alert, Grid
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import useGetQuizByItemId from "../../../../../../hooks/quiz-hooks/useGetQuizByItemId";

const QUESTION_TYPE_LABELS = {
  0: "Single Choice",
  1: "Multiple Choice",
  2: "True / False",
  SingleChoice: "Single Choice",
  MultipleChoice: "Multiple Choice",
  TrueFalse: "True / False",
};

export default function QuizDetailDialog({ open, onClose, courseId, itemId }) {
  const { data: quiz, isLoading, isError } = useGetQuizByItemId(
    open ? courseId : null,
    open ? itemId : null
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        },
      }}
    >
      <Box sx={{ p: 2.5, bgcolor: "background.paper", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E5E7EB" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Quiz Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "grey.50" }}>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {isError && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ borderRadius: "10px" }}>
              Failed to load quiz details.
            </Alert>
          </Box>
        )}

        {!isLoading && !isError && !quiz && (
          <Box sx={{ p: 3 }}>
            <Alert severity="info" sx={{ borderRadius: "10px" }}>
              No quiz data found.
            </Alert>
          </Box>
        )}

        {quiz && (
          <Box>
            {/* General settings */}
            <Box sx={{ p: 2.5, bgcolor: "#FFF", borderRadius: "12px", border: "1px solid #E5E7EB", mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1.5 }}>
                GENERAL SETTINGS
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.5 }}>Description</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {quiz.description || "No description provided."}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.5 }}>Time Limit</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {quiz.timeLimitMinutes > 0 ? `${quiz.timeLimitMinutes} minutes` : "No limit"}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.5 }}>Passing Score</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {quiz.passingScore ?? 70}%
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.5 }}>Max Attempts</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {quiz.maxAttempts > 0 ? quiz.maxAttempts : "Unlimited"}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.5 }}>Show Correct Answers</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {quiz.showCorrectAnswers ? "Yes" : "No"}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.5 }}>Randomize Questions</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {quiz.randomizeQuestions ? "Yes" : "No"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Quiz Questions List */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
              Questions ({quiz.questions?.length ?? 0})
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(quiz.questions ?? []).map((q, idx) => {
                const typeLabel = QUESTION_TYPE_LABELS[q.type] ?? "Unknown";

                return (
                  <Box
                    key={q.id ?? idx}
                    sx={{
                      p: 2.5,
                      borderRadius: "12px",
                      bgcolor: "#FFF",
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1.5 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                          QUESTION #{idx + 1}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", mt: 0.5 }}>
                          {q.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={typeLabel}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, height: 18, fontSize: "0.65rem" }}
                      />
                    </Box>

                    {/* Explanation */}
                    {q.explanation && (
                      <Typography variant="caption" sx={{ display: "block", mb: 2, p: 1, bgcolor: "grey.50", border: "1px solid #E5E7EB", borderRadius: "6px", fontStyle: "italic", color: "text.secondary" }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </Typography>
                    )}

                    {/* Choices list */}
                    {q.choices?.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                          CHOICES:
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {q.choices.map((c, cIdx) => (
                            <Box
                              key={c.id ?? cIdx}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: 1.5,
                                px: 2,
                                borderRadius: "8px",
                                border: "1px solid #E5E7EB",
                                borderColor: c.isCorrect ? "brand.light" : "#E5E7EB",
                                bgcolor: c.isCorrect ? "rgba(63,204,178,0.04)" : "#FFFFFF",
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                {c.isCorrect ? (
                                  <CheckIcon color="primary" sx={{ fontSize: 18 }} />
                                ) : (
                                  <Box sx={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "text.disabled" }} />
                                  </Box>
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "text.primary",
                                    fontWeight: c.isCorrect ? 700 : 500,
                                    fontSize: "0.85rem"
                                  }}
                                >
                                  {c.text}
                                </Typography>
                              </Box>
                              {c.isCorrect && (
                                <Chip
                                  label="Correct Answer"
                                  color="primary"
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
                                />
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                );
              })}

              {(quiz.questions ?? []).length === 0 && (
                <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic", p: 1 }}>
                  No questions added.
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
