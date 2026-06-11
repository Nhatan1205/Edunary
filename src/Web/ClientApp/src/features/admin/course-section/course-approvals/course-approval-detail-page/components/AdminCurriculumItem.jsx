import { useState, useRef } from "react";
import {
  Box, Typography, Card, Button, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, IconButton
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArticleIcon from "@mui/icons-material/Article";
import MovieIcon from "@mui/icons-material/Movie";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DOMPurify from "dompurify";

import QuizDetailDialog from "./QuizDetailDialog";
import AssignmentDetailDialog from "./AssignmentDetailDialog";
import { useHls } from "../../../../../../hooks/media-file-hooks/useHls";

// Video player using useHls hook
function AdminVideoPlayer({ videoId }) {
  const videoRef = useRef(null);
  const { qualityLevels, currentLevel, changeQuality } = useHls(videoId, videoRef);

  if (!videoId) return null;
  return (
    <Box sx={{ mt: 1.5, width: "100%", maxWidth: 500 }}>
      <video
        ref={videoRef}
        controls
        style={{
          width: "100%",
          borderRadius: "8px",
          backgroundColor: "#000",
          display: "block",
          aspectRatio: "16/9",
          border: "1px solid #E5E7EB",
        }}
      />
    </Box>
  );
}

// Icon helper matching CurriculumComparison.jsx
function getItemIcon(type) {
  switch (type?.toLowerCase()) {
    case "lecture":
    case "article":
      return <ArticleIcon sx={{ color: "text.secondary" }} />;
    case "video":
      return <MovieIcon sx={{ color: "text.secondary" }} />;
    case "quiz":
      return <HelpOutlineIcon sx={{ color: "text.secondary" }} />;
    case "assignment":
      return <AssignmentIcon sx={{ color: "text.secondary" }} />;
    default:
      return <ArticleIcon sx={{ color: "text.secondary" }} />;
  }
}

export default function AdminCurriculumItem({ item, globalIndex, courseId }) {
  const [expanded, setExpanded] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [descDialogOpen, setDescDialogOpen] = useState(false);
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);

  const itemType = item.type || "lecture";
  const contentType = item.contentType || itemType;
  const isVideo = contentType === "video";
  const isArticle = contentType === "article";
  const isQuiz = itemType === "quiz";
  const isAssignment = itemType === "assignment";

  const hasDescription = !!item.description && item.description.trim().length > 0;
  const hasResources = item.resources && item.resources.length > 0;

  return (
    <>
      <Card
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
          onClick={() => setExpanded(!expanded)}
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
            "&:hover": { bgcolor: "grey.50" }
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            {getItemIcon(contentType)}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {item.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.tertiary", textTransform: "capitalize" }}>
                {contentType}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            {isVideo && item.videoDuration && (
              <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                {item.videoDuration.replace(/"/g, "")}
              </Typography>
            )}
            <ExpandMoreIcon
              sx={{
                color: "text.secondary",
                fontSize: 18,
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s"
              }}
            />
          </Box>
        </Box>

        {/* Item Body */}
        {expanded && (
          <Box sx={{ p: 2.5, pt: 0, borderTop: "1px solid #F3F4F6", bgcolor: "grey.50" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              {/* Playable Video */}
              {isVideo && item.videoId && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block" }}>
                    Lecture Video:
                  </Typography>
                  <AdminVideoPlayer videoId={item.videoId} />
                </Box>
              )}

              {/* Resources List */}
              {hasResources && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                    Resources / Materials:
                  </Typography>
                  <List sx={{ p: 0, bgcolor: "#FFF", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
                    {item.resources.map((r, ri) => (
                      <ListItem key={r.id || ri} sx={{
                        px: 2, py: 1,
                        borderBottom: ri < item.resources.length - 1 ? "1px solid #E5E7EB" : "none",
                      }}>
                        <InsertDriveFileIcon sx={{ mr: 1, color: "text.tertiary", fontSize: 16 }} />
                        <ListItemText
                          primary={
                            r.fileUrl ? (
                              <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                                {r.fileName}
                              </a>
                            ) : (
                              r.fileName
                            )
                          }
                          slotProps={{ primary: { sx: { fontSize: "0.8rem", color: "text.secondary" } } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Action Buttons for Dialog views */}
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 1 }}>
                {hasDescription && !isAssignment && !isQuiz && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setDescDialogOpen(true)}
                    sx={{
                      borderRadius: "8px",
                      fontWeight: 600,
                      textTransform: "none",
                      color: "brand.main",
                      borderColor: "brand.main",
                      "&:hover": {
                        borderColor: "brand.dark",
                        bgcolor: "rgba(63,204,178,0.04)"
                      }
                    }}
                  >
                    View Description
                  </Button>
                )}

                {isArticle && item.content && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setArticleDialogOpen(true)}
                    sx={{
                      borderRadius: "8px",
                      fontWeight: 600,
                      textTransform: "none",
                      color: "brand.main",
                      borderColor: "brand.main",
                      "&:hover": {
                        borderColor: "brand.dark",
                        bgcolor: "rgba(63,204,178,0.04)"
                      }
                    }}
                  >
                    View Article Content
                  </Button>
                )}

                {isQuiz && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setQuizDialogOpen(true)}
                    sx={{
                      borderRadius: "8px",
                      fontWeight: 600,
                      textTransform: "none",
                      color: "brand.main",
                      borderColor: "brand.main",
                      "&:hover": {
                        borderColor: "brand.dark",
                        bgcolor: "rgba(63,204,178,0.04)"
                      }
                    }}
                  >
                    View Quiz Details
                  </Button>
                )}

                {isAssignment && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setAssignmentDialogOpen(true)}
                    sx={{
                      borderRadius: "8px",
                      fontWeight: 600,
                      textTransform: "none",
                      color: "brand.main",
                      borderColor: "brand.main",
                      "&:hover": {
                        borderColor: "brand.dark",
                        bgcolor: "rgba(63,204,178,0.04)"
                      }
                    }}
                  >
                    View Assignment Details
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Card>

      {/* Description Dialog */}
      <Dialog open={descDialogOpen} onClose={() => setDescDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Description: {item.title}</Typography>
          <IconButton onClick={() => setDescDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            variant="body2"
            component="div"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description || "") }}
            sx={{ color: "text.primary", lineHeight: 1.6 }}
          />
        </DialogContent>
      </Dialog>

      {/* Article Content Dialog */}
      <Dialog open={articleDialogOpen} onClose={() => setArticleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Article Content: {item.title}</Typography>
          <IconButton onClick={() => setArticleDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            variant="body2"
            component="div"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content || "") }}
            sx={{ color: "text.primary", lineHeight: 1.6 }}
          />
        </DialogContent>
      </Dialog>

      {/* Quiz Detail Dialog */}
      {isQuiz && (
        <QuizDetailDialog
          open={quizDialogOpen}
          onClose={() => setQuizDialogOpen(false)}
          courseId={courseId}
          itemId={item.itemId}
        />
      )}

      {/* Assignment Detail Dialog */}
      {isAssignment && (
        <AssignmentDetailDialog
          open={assignmentDialogOpen}
          onClose={() => setAssignmentDialogOpen(false)}
          courseId={courseId}
          itemId={item.itemId}
        />
      )}
    </>
  );
}
