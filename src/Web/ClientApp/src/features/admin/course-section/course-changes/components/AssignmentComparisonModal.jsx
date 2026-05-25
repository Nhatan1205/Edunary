import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  IconButton,
  Modal,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DOMPurify from "dompurify";

export default function AssignmentComparisonModal({ open, onClose, title, assignment }) {
  if (!assignment) return null;
  return (
    <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Card
        sx={{
          width: "100%",
          maxWidth: 800,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2.5, bgcolor: "background.paper", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E5E7EB" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Compare Assignment details: {title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "grey.50" }}>
          {/* Assignment Settings Changes */}
          {assignment.settingChanges?.length > 0 && (
            <Box sx={{ p: 2.5, bgcolor: "#FFF", borderRadius: "12px", border: "1px solid #E5E7EB", mb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
              {assignment.settingChanges.map((sc, idx) => {
                const isRichText = ["Description", "Instructions"].includes(sc.settingName);
                return (
                  <Box key={idx}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>{sc.settingName}</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ p: 1.5, bgcolor: "#F8F9FA", borderRadius: "8px", border: "1px solid #E5E7EB", height: "100%" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, display: "block", mb: 0.5 }}>APPROVED VERSION</Typography>
                          {isRichText ? (
                            <Box
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sc.oldValue || "") }}
                              sx={{ fontSize: "0.85rem", color: "text.secondary", "& p": { mb: 1 } }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "pre-line", fontSize: "0.85rem" }}>
                              {sc.oldValue || "—"}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ p: 1.5, bgcolor: "#F8F9FA", borderRadius: "8px", border: "1px solid #E5E7EB", height: "100%" }}>
                          <Typography variant="caption" sx={{ color: "brand.dark", fontWeight: 700, display: "block", mb: 0.5 }}>UPDATED VERSION</Typography>
                          {isRichText ? (
                            <Box
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sc.newValue || "") }}
                              sx={{ fontSize: "0.85rem", color: "brand.dark", fontWeight: 700, "& p": { mb: 1 } }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ color: "brand.dark", fontWeight: 700, whiteSpace: "pre-line", fontSize: "0.85rem" }}>
                              {sc.newValue || "—"}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Assignment Questions */}
          {assignment.questions?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
                Tasks / Questions ({assignment.questions.length})
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {assignment.questions.map((q, idx) => {
                  const isAdded = q.status === "added";
                  const isRemoved = q.status === "removed";
                  const isModified = q.status === "modified";

                  return (
                    <Box key={idx} sx={{ p: 2.5, bgcolor: "#FFF", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                          TASK #{idx + 1}
                        </Typography>
                        <Chip
                          label={isAdded ? "Added" : isRemoved ? "Removed" : isModified ? "Modified" : "Unchanged"}
                          size="small"
                          color={isAdded ? "primary" : isRemoved ? "error" : isModified ? "warning" : "default"}
                          variant="outlined"
                          sx={{ fontWeight: 700, height: 18, fontSize: "0.65rem" }}
                        />
                      </Box>

                      {/* Question Text */}
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.5 }}>
                        QUESTION:
                      </Typography>
                      {isModified && q.oldQuestionText !== q.newQuestionText ? (
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ p: 1.5, bgcolor: "#F8F9FA", borderRadius: "8px", border: "1px solid #E5E7EB", height: "100%" }}>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, display: "block", mb: 0.5 }}>APPROVED VERSION</Typography>
                              <Box
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.oldQuestionText || "") }}
                                sx={{ fontSize: "0.85rem", color: "text.secondary", "& p": { mb: 1 } }}
                              />
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ p: 1.5, bgcolor: "#F8F9FA", borderRadius: "8px", border: "1px solid #E5E7EB", height: "100%" }}>
                              <Typography variant="caption" sx={{ color: "brand.dark", fontWeight: 700, display: "block", mb: 0.5 }}>UPDATED VERSION</Typography>
                              <Box
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.newQuestionText || "") }}
                                sx={{ fontSize: "0.85rem", color: "brand.dark", fontWeight: 700, "& p": { mb: 1 } }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      ) : (
                        <Box
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.newQuestionText || q.oldQuestionText || "") }}
                          sx={{
                            p: 1.5,
                            bgcolor: isRemoved ? "#F8F9FA" : isAdded ? "#F8F9FA" : "#FFF",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                            color: isRemoved ? "text.secondary" : "text.primary",
                            mb: 2
                          }}
                        />
                      )}

                      {/* Example Answer Key */}
                      {(q.newExampleAnswer || q.oldExampleAnswer) && (
                        <Box sx={{ mt: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.5 }}>
                            EXAMPLE ANSWER KEY:
                          </Typography>
                          {isModified && q.oldExampleAnswer !== q.newExampleAnswer ? (
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ p: 1.5, bgcolor: "#F8F9FA", borderRadius: "8px", border: "1px solid #E5E7EB", height: "100%" }}>
                                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, display: "block", mb: 0.5 }}>APPROVED VERSION</Typography>
                                  <Box
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.oldExampleAnswer || "") }}
                                    sx={{ fontSize: "0.85rem", color: "text.secondary", "& p": { mb: 1 } }}
                                  />
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ p: 1.5, bgcolor: "#F8F9FA", borderRadius: "8px", border: "1px solid #E5E7EB", height: "100%" }}>
                                  <Typography variant="caption" sx={{ color: "brand.dark", fontWeight: 700, display: "block", mb: 0.5 }}>UPDATED VERSION</Typography>
                                  <Box
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.newExampleAnswer || "") }}
                                    sx={{ fontSize: "0.85rem", color: "brand.dark", fontWeight: 700, "& p": { mb: 1 } }}
                                  />
                                </Box>
                              </Grid>
                            </Grid>
                          ) : (
                            <Box
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.newExampleAnswer || q.oldExampleAnswer || "") }}
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
                          )}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Card>
    </Modal>
  );
}
