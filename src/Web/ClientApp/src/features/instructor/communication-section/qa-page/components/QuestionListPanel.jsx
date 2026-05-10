import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
  Divider,
} from "@mui/material";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { formatTimeAgo, stripHtml } from "../../../../../utils/helpers";
import useToggleFeatured from "../../../../../hooks/course-qa-hooks/useToggleFeatured";
import useToggleReadStatus from "../../../../../hooks/course-qa-hooks/useToggleReadStatus";

export default function QuestionListPanel({
  questions,
  isLoading,
  selectedQuestion,
  onSelectQuestion,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuQuestion, setMenuQuestion] = useState(null);

  const toggleFeatured = useToggleFeatured();
  const toggleReadStatus = useToggleReadStatus();

  function handleOpenMenu(e, question) {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuQuestion(question);
  }

  function handleCloseMenu() {
    setMenuAnchor(null);
    setMenuQuestion(null);
  }

  function handleToggleFeatured() {
    if (!menuQuestion) return;
    toggleFeatured.mutate(menuQuestion.id);
    handleCloseMenu();
  }

  function handleToggleReadStatus() {
    if (!menuQuestion) return;
    // Flip local state in both directions
    const currentRead = localRead[menuQuestion.id] !== undefined
      ? localRead[menuQuestion.id]
      : menuQuestion.isRead;
    setLocalRead((prev) => ({ ...prev, [menuQuestion.id]: !currentRead }));
    toggleReadStatus.mutate(menuQuestion.id);
    handleCloseMenu();
  }

  const [localRead, setLocalRead] = useState({});

  function handleSelectQuestion(q) {
    const effectiveRead = localRead[q.id] !== undefined ? localRead[q.id] : q.isRead;
    if (!effectiveRead) {
      setLocalRead((prev) => ({ ...prev, [q.id]: true }));
      toggleReadStatus.mutate(q.id);
    }
    onSelectQuestion(q);
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Question list */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress size={28} sx={{ color: "brand.main" }} />
          </Box>
        ) : questions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 40, color: "grey.300", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No questions found
            </Typography>
          </Box>
        ) : (
          questions.map((q) => {
            const isSelected = selectedQuestion?.id === q.id;
            const effectiveRead = localRead[q.id] !== undefined ? localRead[q.id] : q.isRead;

            return (
              <Box
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                sx={{
                  px: 2,
                  py: 1.8,
                  cursor: "pointer",
                  position: "relative",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: isSelected ? "grey.100" : "transparent",
                  transition: "background-color 0.12s",
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Avatar
                    src={q.authorAvatar}
                    sx={{ width: 34, height: 34, flexShrink: 0, mt: 0.2 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Title row */}
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={0.5} >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          lineHeight: 1.4,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          pr: 0.5,
                          flex: 1,
                        }}
                      >
                        {q.title}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.3} sx={{ flexShrink: 0 }}>
                        {!effectiveRead && (
                          <Tooltip title="Unread">
                            <FiberManualRecordIcon sx={{ fontSize: 14, color: "brand.main" }} />
                          </Tooltip>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, q)}
                          sx={{ p: 0.3, color: "grey.400", "&:hover": { color: "grey.700" } }}
                        >
                          <MoreVertIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* Detail preview */}
                    {q.detail && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mt: 1,
                          lineHeight: 1.4,
                          fontWeight: !effectiveRead ? 700 : 400,
                          color: !effectiveRead ? "text.primary" : "text.secondary",
                        }}
                      >
                        {stripHtml(q.detail)}
                      </Typography>
                    )}

                    {/* Author + time */}
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.4, display: "block" }}>
                      {q.authorName} · {formatTimeAgo(q.created)}
                    </Typography>

                    {/* Badges + counts */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.8, flexWrap: "wrap", gap: 0.5 }}>
                      {q.isFeatured && (
                        <Chip
                          label="Featured question"
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            bgcolor: "warning.lighter",
                            color: "warning.dark",
                            border: "1px solid",
                            borderColor: "warning.light",
                          }}
                        />
                      )}
                      <Stack direction="row" alignItems="center" spacing={0.4}>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem" }}>
                          {q.answerCount}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.4}>
                        <ArrowCircleUpIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem" }}>
                          {q.upvoteCount}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            );
          })
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { minWidth: 200, borderRadius: 2, boxShadow: 3 },
        }}
      >
        <MenuItem
          onClick={handleToggleFeatured}
          sx={{ fontSize: "0.875rem", py: 1 }}
        >
          {menuQuestion?.isFeatured ? "Remove from featured questions" : "Add to featured questions"}
        </MenuItem>
        <MenuItem onClick={handleToggleReadStatus} sx={{ fontSize: "0.875rem", py: 1 }}>
          {menuQuestion?.isRead ? "Mark as Unread" : "Mark as Read"}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleCloseMenu} sx={{ fontSize: "0.875rem", py: 1, color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
