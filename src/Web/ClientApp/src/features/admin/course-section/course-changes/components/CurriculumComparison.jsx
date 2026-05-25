import { Box, Typography, Card, Chip, Button, Grid } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FolderIcon from "@mui/icons-material/Folder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArticleIcon from "@mui/icons-material/Article";
import MovieIcon from "@mui/icons-material/Movie";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CompareIcon from "@mui/icons-material/Compare";
import DOMPurify from "dompurify";
import MiniVideoPlayer from "./MiniVideoPlayer";

// --- ITEM TYPE ICON HELPER ---
function getItemIcon(type) {
  switch (type?.toLowerCase()) {
    case "lecture":
    case "article":
      return <ArticleIcon sx={{ color: "brand.main" }} />;
    case "video":
      return <MovieIcon sx={{ color: "info.main" }} />;
    case "quiz":
      return <HelpOutlineIcon sx={{ color: "brand.main" }} />;
    case "assignment":
      return <AssignmentIcon sx={{ color: "secondary.main" }} />;
    default:
      return <ArticleIcon />;
  }
}

export default function CurriculumComparison({
  comparisonList = [],
  activeData,
  expandedSections,
  toggleSection,
  expandedItems,
  toggleItem,
  onCompareClick,
  onShowQuizDetails,
  onShowAssignmentDetails,
}) {
  if (!comparisonList.length) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="body1" sx={{ color: "text.secondary", fontWeight: 600 }}>
          No Curriculum structure changes detected.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {comparisonList.map((section, sIndex) => {
        const isSecAdded = section.status === "added";
        const isSecRemoved = section.status === "removed";
        const isSecModified = section.status === "modified";
        const isExpanded = !!expandedSections[section.sectionId];

        return (
          <Box
            key={section.sectionId}
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              overflow: "hidden",
              bgcolor: "#FFFFFF"
            }}
          >
            {/* Section Header (Clickable for Collapse) */}
            <Box
              onClick={() => toggleSection(section.sectionId)}
              sx={{
                p: 2,
                bgcolor: "grey.50",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                borderBottom: isExpanded ? "1px solid #E5E7EB" : "none",
                userSelect: "none"
              }}
            >
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <FolderIcon sx={{ color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.tertiary" }}>
                    SECTION #{sIndex + 1}
                  </Typography>
                  {isSecModified && section.oldTitle !== section.newTitle ? (
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        Before: {section.oldTitle}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "brand.dark" }}>
                        Current: {section.newTitle}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isSecRemoved ? "text.secondary" : "text.primary" }}>
                      {section.newTitle || section.oldTitle}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                {isSecAdded && <Chip label="Added" color="primary" size="small" variant="outlined" sx={{ fontWeight: 700, height: 20 }} />}
                {isSecRemoved && <Chip label="Removed" color="error" size="small" variant="outlined" sx={{ fontWeight: 700, height: 20 }} />}
                {isSecModified && <Chip label="Modified" color="warning" size="small" variant="outlined" sx={{ fontWeight: 700, height: 20 }} />}
                <ExpandMoreIcon
                  sx={{
                    color: "text.secondary",
                    transform: isExpanded ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s"
                  }}
                />
              </Box>
            </Box>

            {/* Section Items (Collapsible List) */}
            {isExpanded && (
              <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5, bgcolor: "#FAFAFA" }}>
                {section.items?.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic", p: 1 }}>
                    No items in this section.
                  </Typography>
                ) : (
                  section.items.map((item, iIndex) => {
                    const isItemAdded = item.status === "added" || isSecAdded;
                    const isItemRemoved = item.status === "removed" || isSecRemoved;
                    const isItemModified = item.status === "modified" && !isSecAdded && !isSecRemoved;
                    const isItemExpanded = !!expandedItems[item.itemId];
                    const canExpand = isItemModified || isItemAdded;

                    return (
                      <Card
                        key={item.itemId}
                        sx={{
                          borderRadius: "10px",
                          border: "1px solid #E5E7EB",
                          boxShadow: "none",
                          bgcolor: "#FFFFFF",
                          overflow: "hidden"
                        }}
                      >
                        {/* Item Header */}
                        <Box
                          onClick={() => canExpand && toggleItem(item.itemId)}
                          sx={{
                            p: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            cursor: canExpand ? "pointer" : "default",
                            userSelect: "none",
                            "&:hover": canExpand ? { bgcolor: "grey.50" } : {}
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                            {getItemIcon(item.type)}
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: isItemRemoved ? "text.secondary" : "text.primary" }}>
                                {item.newTitle || item.oldTitle}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.tertiary", textTransform: "capitalize" }}>
                                {item.type}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                            {isItemAdded && <Chip label="Added" color="primary" size="small" variant="outlined" sx={{ fontWeight: 700, height: 18, fontSize: "0.65rem" }} />}
                            {isItemRemoved && <Chip label="Removed" color="error" size="small" variant="outlined" sx={{ fontWeight: 700, height: 18, fontSize: "0.65rem" }} />}
                            {isItemModified && <Chip label="Modified" color="warning" size="small" variant="outlined" sx={{ fontWeight: 700, height: 18, fontSize: "0.65rem" }} />}
                            {canExpand && (
                              <ExpandMoreIcon
                                sx={{
                                  color: "text.secondary",
                                  fontSize: 18,
                                  transform: isItemExpanded ? "rotate(180deg)" : "none",
                                  transition: "transform 0.2s"
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Item Body (Collapsible property changes) */}
                        {canExpand && isItemExpanded && (
                          <Box sx={{ p: 2.5, pt: 0, borderTop: "1px solid #F3F4F6", bgcolor: "grey.50" }}>
                            {/* If modified, render properties changed */}
                            {isItemModified && item.propertyChanges?.length > 0 && (
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                                {item.propertyChanges.map((change, pIdx) => {
                                  // 1. Video change
                                  if (change.propertyName === "Video") {
                                    const oldVid = change.oldValue ? JSON.parse(change.oldValue) : null;
                                    const newVid = change.newValue ? JSON.parse(change.newValue) : null;
                                    return (
                                      <Box key={pIdx}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                                          Lecture Video Replacement:
                                        </Typography>
                                        <Grid container spacing={2}>
                                          <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, display: "block" }}>
                                              PREVIOUS VIDEO: {oldVid ? `${oldVid.fileName} (${oldVid.duration})` : "None"}
                                            </Typography>
                                          </Grid>
                                          <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" sx={{ color: "brand.dark", fontWeight: 700, display: "block" }}>
                                              UPDATED VIDEO: {newVid ? `${newVid.fileName} (${newVid.duration})` : "None"}
                                            </Typography>
                                          </Grid>
                                          <Grid size={{ xs: 12, sm: 6 }}>
                                            {oldVid ? <MiniVideoPlayer url={oldVid.fileUrl} /> : <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>No video</Typography>}
                                          </Grid>
                                          <Grid size={{ xs: 12, sm: 6 }}>
                                            {newVid ? <MiniVideoPlayer url={newVid.fileUrl} /> : <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>No video</Typography>}
                                          </Grid>
                                        </Grid>
                                      </Box>
                                    );
                                  }

                                  // 2. Content change (Articles)
                                  if (change.propertyName === "Content") {
                                    return (
                                      <Box key={pIdx} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                          Article lecture content updated
                                        </Typography>
                                        <Button
                                          variant="outlined"
                                          startIcon={<CompareIcon />}
                                          size="small"
                                          onClick={() => onCompareClick(item.newTitle, change.oldValue, change.newValue)}
                                          sx={{ borderRadius: "8px", fontWeight: 600 }}
                                        >
                                          Compare Content
                                        </Button>
                                      </Box>
                                    );
                                  }

                                  // 3. Resources change
                                  if (change.propertyName === "Resources") {
                                    const oldRes = JSON.parse(change.oldValue || "[]");
                                    const newRes = JSON.parse(change.newValue || "[]");
                                    const addedRes = newRes.filter(n => !oldRes.some(o => o.id === n.id));
                                    const removedRes = oldRes.filter(o => !newRes.some(n => n.id === o.id));

                                    return (
                                      <Box key={pIdx}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                                          Lecture Resources updated:
                                        </Typography>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                          {addedRes.map((r, rIdx) => (
                                            <Box key={rIdx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "brand.main" }} />
                                              <Typography variant="body2" sx={{ color: "brand.dark", fontWeight: 600 }}>
                                                Added Resource: <a href={r.fileUrl} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>{r.fileName}</a>
                                              </Typography>
                                            </Box>
                                          ))}
                                          {removedRes.map((r, rIdx) => (
                                            <Box key={rIdx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "text.disabled" }} />
                                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                Removed Resource: {r.fileName}
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Box>
                                      </Box>
                                    );
                                  }

                                  // 4. Default scalar properties
                                  return (
                                    <Box key={pIdx} sx={{ mt: 1 }}>
                                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block" }}>
                                        {change.propertyName} Changed:
                                      </Typography>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                                          Before: {change.oldValue || "—"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>→</Typography>
                                        <Typography variant="body2" sx={{ color: "brand.dark", fontWeight: 700 }}>
                                          Current: {change.newValue}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  );
                                })}
                              </Box>
                            )}

                            {/* If added and has content/video, render details directly */}
                            {isItemAdded && (
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                                {item.type === "lecture" && item.propertyChanges?.map((change, pIdx) => {
                                  if (change.propertyName === "Video") {
                                    const newVid = change.newValue ? JSON.parse(change.newValue) : null;
                                    return (
                                      <Box key={pIdx}>
                                        {newVid ? (
                                          <>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: "brand.dark", display: "block", mb: 0.5 }}>
                                              Lecture Video: {newVid.fileName} ({newVid.duration})
                                            </Typography>
                                            <MiniVideoPlayer url={newVid.fileUrl} />
                                          </>
                                        ) : (
                                          <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>
                                            No video content
                                          </Typography>
                                        )}
                                      </Box>
                                    );
                                  }
                                  if (change.propertyName === "Content") {
                                    return (
                                      <Box key={pIdx}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: "brand.dark", display: "block", mb: 1 }}>
                                          Lecture Content (HTML):
                                        </Typography>
                                        <Box
                                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(change.newValue) }}
                                          sx={{
                                            p: 2, bgcolor: "#FFF", borderRadius: "8px", border: "1px solid #E5E7EB",
                                            fontSize: "0.85rem", color: "text.primary"
                                          }}
                                        />
                                      </Box>
                                    );
                                  }
                                  return null;
                                })}
                              </Box>
                            )}

                            {/* If Assessment (Quiz/Assignment), show the dialog trigger button */}
                            {(item.type === "quiz" || item.type === "assignment") && (
                              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-start" }}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={() => {
                                    if (item.type === "quiz") {
                                      onShowQuizDetails(item.quizId);
                                    } else {
                                      onShowAssignmentDetails(item.assignmentId);
                                    }
                                  }}
                                  sx={{ borderRadius: "8px", fontWeight: 700 }}
                                >
                                  {item.type === "quiz" ? "Compare Quiz details" : "Compare Assignment details"}
                                </Button>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Card>
                    );
                  })
                )}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
