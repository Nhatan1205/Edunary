import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, Typography,
  Chip, CircularProgress, Alert, Grid
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DOMPurify from "dompurify";
import useGetAssignmentByItemId from "../../../../../../hooks/assignment-hooks/useGetAssignmentByItemId";

export default function AssignmentDetailDialog({ open, onClose, courseId, itemId }) {
  const { data: assignment, isLoading, isError } = useGetAssignmentByItemId(
    open ? courseId : null,
    open ? itemId : null,
    { enabled: !!open && !!courseId && !!itemId }
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Assignment Details
          </Typography>
          {assignment && (
            <Chip
              label={assignment.isPublished ? "Published" : "Unpublished"}
              size="small"
              color={assignment.isPublished ? "success" : "warning"}
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: "0.72rem", height: 22 }}
            />
          )}
        </Box>
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
              Failed to load assignment details.
            </Alert>
          </Box>
        )}

        {!isLoading && !isError && !assignment && (
          <Box sx={{ p: 3 }}>
            <Alert severity="info" sx={{ borderRadius: "10px" }}>
              No assignment data found.
            </Alert>
          </Box>
        )}

        {assignment && (
          <Box>
            {/* General settings & Instructions */}
            <Box sx={{ p: 2.5, bgcolor: "#FFF", borderRadius: "12px", border: "1px solid #E5E7EB", mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1.5 }}>
                GENERAL SETTINGS & INSTRUCTIONS
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.5 }}>Description</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {assignment.description || "—"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.5 }}>Estimated Duration</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                    {assignment.estimatedDurationMinutes ?? 0} minutes
                  </Typography>
                </Grid>
                {assignment.instructions && (
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.5 }}>Instructions</Typography>
                    <Box
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(assignment.instructions) }}
                      sx={{
                        p: 1.5,
                        bgcolor: "grey.50",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        color: "text.primary"
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Questions list */}
            {assignment.questions?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
                  Tasks / Questions ({assignment.questions.length})
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {assignment.questions.map((q, idx) => (
                    <Box key={q.id ?? idx} sx={{ p: 2.5, bgcolor: "#FFF", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                          TASK #{idx + 1}
                        </Typography>
                      </Box>

                      {/* Question Text */}
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.5 }}>
                        QUESTION:
                      </Typography>
                      <Box
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.questionText || "") }}
                        sx={{
                          p: 1.5,
                          bgcolor: "#F8F9FA",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          color: "text.primary",
                          mb: 2
                        }}
                      />

                      {/* Example Answer Key */}
                      {q.exampleAnswer && (
                        <Box sx={{ mt: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.5 }}>
                            EXAMPLE ANSWER KEY:
                          </Typography>
                          <Box
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.exampleAnswer || "") }}
                            sx={{
                              p: 1.5,
                              bgcolor: "grey.50",
                              border: "1px solid #E5E7EB",
                              borderRadius: "8px",
                              fontStyle: "italic",
                              fontSize: "0.85rem",
                              color: "text.primary"
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {(assignment.questions ?? []).length === 0 && (
              <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic", p: 1 }}>
                No questions added.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
