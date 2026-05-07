import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Stack,
  Chip,
  Tooltip,
  Menu,
  CircularProgress,
} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { MOCK_QUESTIONS } from "../mockData";

function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export default function QuestionListPanel({
  selectedCourseId,
  selectedQuestion,
  onSelectQuestion,
  filterBy,
  sortBy,
  searchText,
}) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuQuestion, setMenuQuestion] = useState(null);
  const [localFeatured, setLocalFeatured] = useState({});

  const filtered = useMemo(() => {
    let list = MOCK_QUESTIONS.filter((q) => {
      if (selectedCourseId !== null && q.courseId !== selectedCourseId) return false;
      if (filterBy === "unread" && q.isRead) return false;
      if (filterBy === "noAnswers" && q.answerCount > 0) return false;
      if (filterBy === "featured" && !q.isFeatured) return false;
      if (
        searchText &&
        !q.title.toLowerCase().includes(searchText.toLowerCase()) &&
        !stripHtml(q.detail).toLowerCase().includes(searchText.toLowerCase())
      ) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "oldestFirst") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "mostUpvoted") return b.upvoteCount - a.upvoteCount;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return list;
  }, [selectedCourseId, filterBy, sortBy, searchText]);

  function handleOpenMenu(e, question) {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuQuestion(question);
  }

  function handleCloseMenu() {
    setMenuAnchor(null);
    setMenuQuestion(null);
  }

  function handleToggleFeatured(questionId) {
    setLocalFeatured((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
    handleCloseMenu();
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      {/* Question list */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 40, color: "grey.300", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No questions found
            </Typography>
          </Box>
        ) : (
          filtered.map((q) => {
            const isFeatured = localFeatured[q.id] !== undefined ? localFeatured[q.id] : q.isFeatured;
            const isSelected = selectedQuestion?.id === q.id;

            return (
              <Box
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                sx={{
                  px: 2,
                  py: 1.8,
                  cursor: "pointer",
                  position: "relative",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: isSelected ? "grey.100" : "transparent",
                  transition: "background-color 0.12s",
                  "&:hover": {
                    bgcolor: "grey.100",
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Avatar
                    src={q.authorAvatar}
                    sx={{ width: 34, height: 34, flexShrink: 0, mt: 0.2 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Title row */}
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={0.5}>
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
                        {!q.isRead && (
                          <Tooltip title="Unread">
                            <FiberManualRecordIcon sx={{ fontSize: 10, color: "brand.main" }} />
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
                          mt: 0.3,
                          lineHeight: 1.4,
                        }}
                      >
                        {stripHtml(q.detail)}
                      </Typography>
                    )}

                    {/* Author + time */}
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.4, display: "block" }}>
                      {q.authorName} · {formatRelativeTime(q.createdAt)}
                    </Typography>

                    {/* Badges + counts */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.8, flexWrap: "wrap", gap: 0.5 }}>
                      {isFeatured && (
                        <Chip
                          label="Featured"
                          size="small"
                          icon={<StarIcon sx={{ fontSize: "12px !important", color: "warning.main !important" }} />}
                          sx={{
                            height: 18,
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            bgcolor: "warning.lighter",
                            color: "warning.dark",
                            border: "1px solid",
                            borderColor: "warning.light",
                            "& .MuiChip-icon": { ml: 0.5 },
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
                        <ThumbUpOutlinedIcon sx={{ fontSize: 12, color: "text.disabled" }} />
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
          onClick={() => handleToggleFeatured(menuQuestion?.id)}
          sx={{ fontSize: "0.875rem", py: 1 }}
        >
          {menuQuestion?.isFeatured ? "Remove from featured questions" : "Add to featured questions"}
        </MenuItem>
        <MenuItem onClick={handleCloseMenu} sx={{ fontSize: "0.875rem", py: 1 }}>
          <FiberManualRecordIcon sx={{ fontSize: 12, mr: 1.5, color: "brand.main" }} />
          Mark as Unread
        </MenuItem>
        <MenuItem onClick={handleCloseMenu} sx={{ fontSize: "0.875rem", py: 1, color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
