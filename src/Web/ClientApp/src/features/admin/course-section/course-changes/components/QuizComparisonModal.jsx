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
import CheckIcon from "@mui/icons-material/Check";
import DOMPurify from "dompurify";

export default function QuizComparisonModal({ open, onClose, title, quiz }) {
  if (!quiz) return null;
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
            Compare Quiz details: {title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "grey.50" }}>
          {/* General settings changed */}
          {quiz.settingChanges?.length > 0 && (
            <Box sx={{ p: 2.5, bgcolor: "#FFF", borderRadius: "12px", border: "1px solid #E5E7EB", mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1.5 }}>
                GENERAL SETTINGS CHANGED
              </Typography>
              <Grid container spacing={2}>
                {quiz.settingChanges.map((sc, idx) => {
                  const isRichText = ["Description"].includes(sc.settingName);
                  return (
                    <Grid key={idx} size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.5 }}>{sc.settingName}</Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Box sx={{ px: 1.5, py: 1, bgcolor: "#F8F9FA", borderRadius: "8px", border: "1px solid #E5E7EB", height: "100%" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, display: "block", mb: 0.5 }}>APPROVED VERSION</Typography>
                          {isRichText ? (
                            <Box
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sc.oldValue || "") }}
                              sx={{ fontSize: "0.85rem", color: "text.secondary", "& p": { mb: 1 } }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                              {sc.oldValue}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ px: 1.5, py: 1, bgcolor: "#F8F9FA", borderRadius: "8px", border: "1px solid #E5E7EB", height: "100%" }}>
                          <Typography variant="caption" sx={{ color: "brand.dark", fontWeight: 700, display: "block", mb: 0.5 }}>UPDATED VERSION</Typography>
                          {isRichText ? (
                            <Box
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sc.newValue || "") }}
                              sx={{ fontSize: "0.85rem", color: "brand.dark", fontWeight: 700, "& p": { mb: 1 } }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{ color: "brand.dark", fontWeight: 700, fontSize: "0.85rem" }}>
                              {sc.newValue}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Quiz Questions List */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
            Questions Compare Details ({quiz.questions?.length ?? 0})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {quiz.questions?.map((q, idx) => {
              const isAdded = q.status === "added";
              const isRemoved = q.status === "removed";
              const isModified = q.status === "modified";

              return (
                <Box
                  key={idx}
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
                      {q.oldType && q.newType && q.oldType !== q.newType ? (
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, ml: 1 }}>
                          <Chip label={`Type Before: ${q.oldType}`} size="small" sx={{ height: 16, fontSize: "0.65rem", bgcolor: "#F8F9FA", color: "text.secondary", border: "1px solid #E5E7EB" }} />
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>→</Typography>
                          <Chip label={`Type Current: ${q.newType}`} size="small" sx={{ height: 16, fontSize: "0.65rem", bgcolor: "#F8F9FA", color: "brand.dark", border: "1px solid #E5E7EB", fontWeight: 700 }} />
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: "text.tertiary", ml: 1 }}>
                          ({q.newType || q.oldType})
                        </Typography>
                      )}
                      {isModified ? (
                        <Box sx={{ mt: 0.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Box sx={{ p: 1, bgcolor: "#F8F9FA", borderRadius: "6px", border: "1px solid #E5E7EB" }}>
                            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                              Before: {q.oldName}
                            </Typography>
                          </Box>
                          <Box sx={{ p: 1, bgcolor: "#F8F9FA", borderRadius: "6px", border: "1px solid #E5E7EB" }}>
                            <Typography variant="body2" sx={{ color: "brand.dark", fontWeight: 700, fontSize: "0.85rem" }}>
                              Current: {q.newName}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 700, color: isRemoved ? "text.secondary" : "text.primary", mt: 0.5 }}>
                          {q.newName || q.oldName}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={isAdded ? "Added" : isRemoved ? "Removed" : isModified ? "Modified" : "Unchanged"}
                      size="small"
                      color={isAdded ? "primary" : isRemoved ? "error" : isModified ? "warning" : "default"}
                      variant="outlined"
                      sx={{ fontWeight: 700, height: 18, fontSize: "0.65rem" }}
                    />
                  </Box>

                  {/* Explanation Diff */}
                  {q.oldExplanation !== q.newExplanation ? (
                    <Box sx={{ mt: 1.5, mb: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.5 }}>
                        EXPLANATION CHANGED:
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Box sx={{ p: 1, bgcolor: "#F8F9FA", borderRadius: "6px", border: "1px solid #E5E7EB" }}>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            Before: {q.oldExplanation || "—"}
                          </Typography>
                        </Box>
                        <Box sx={{ p: 1, bgcolor: "#F8F9FA", borderRadius: "6px", border: "1px solid #E5E7EB" }}>
                          <Typography variant="caption" sx={{ color: "brand.dark", fontWeight: 700, display: "block" }}>
                            Current: {q.newExplanation || "—"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    q.newExplanation && (
                      <Typography variant="caption" sx={{ display: "block", mb: 2, p: 1, bgcolor: "grey.50", border: "1px solid #E5E7EB", borderRadius: "6px", fontStyle: "italic", color: "text.secondary" }}>
                        <strong>Explanation:</strong> {q.newExplanation}
                      </Typography>
                    )
                  )}

                  {/* Choices list */}
                  {q.choices?.length > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                        CHOICES:
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {q.choices.map((c, cIdx) => {
                          const oldCorrect = c.oldIsCorrect;
                          const newCorrect = c.newIsCorrect;
                          const correctChanged = oldCorrect !== newCorrect;
                          const cAdded = c.status === "added";
                          const cRemoved = c.status === "removed";
                          const cModified = c.status === "modified";

                          return (
                            <Box
                              key={cIdx}
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                p: 1.5,
                                px: 2,
                                borderRadius: "8px",
                                border: "1px solid #E5E7EB",
                                bgcolor: "transparent",
                                borderColor: newCorrect ? "brand.light" : "#E5E7EB",
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
                                  {newCorrect ? (
                                    <CheckIcon color="primary" sx={{ fontSize: 18 }} />
                                  ) : (
                                    <Box sx={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "text.disabled" }} />
                                    </Box>
                                  )}
                                  <Box sx={{ flexGrow: 1 }}>
                                    {cModified && c.oldText !== c.newText ? (
                                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                        <Box sx={{ px: 1, py: 0.5, bgcolor: "#F8F9FA", borderRadius: "4px", border: "1px solid #E5E7EB" }}>
                                          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                                            Before: {c.oldText}
                                          </Typography>
                                        </Box>
                                        <Box sx={{ px: 1, py: 0.5, bgcolor: "#F8F9FA", borderRadius: "4px", border: "1px solid #E5E7EB" }}>
                                          <Typography variant="body2" sx={{ color: "brand.dark", fontWeight: 700, fontSize: "0.85rem" }}>
                                            Current: {c.newText}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: cRemoved ? "text.secondary" : cAdded ? "brand.dark" : "text.primary",
                                          fontWeight: newCorrect ? 700 : 500,
                                          fontSize: "0.85rem"
                                        }}
                                      >
                                        {c.newText || c.oldText} {cRemoved && "(Removed)"} {cAdded && "(Added)"}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  {correctChanged ? (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                      <Chip
                                        label={`Before: ${oldCorrect ? "Correct" : "Incorrect"}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 18, fontSize: "0.65rem", fontWeight: 600, color: "text.secondary", borderColor: "#E5E7EB", bgcolor: "#F8F9FA" }}
                                      />
                                      <Typography variant="caption" sx={{ color: "text.secondary" }}>→</Typography>
                                      <Chip
                                        label={`Current: ${newCorrect ? "Correct" : "Incorrect"}`}
                                        size="small"
                                        color={newCorrect ? "primary" : "default"}
                                        variant="outlined"
                                        sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
                                      />
                                    </Box>
                                  ) : (
                                    newCorrect && (
                                      <Chip
                                        label="Correct Answer"
                                        color="primary"
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }}
                                      />
                                    )
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Card>
    </Modal>
  );
}
