import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Stack,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Button,
  TextField,
  Paper,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SchoolIcon from "@mui/icons-material/School";
import { MOCK_ANSWERS } from "../mockData";

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

function AnswerCard({ answer, onToggleTop }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(answer.upvoteCount);

  function handleUpvote() {
    setUpvoted((prev) => !prev);
    setUpvoteCount((prev) => (upvoted ? prev - 1 : prev + 1));
  }

  return (
    <Box sx={{ py: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar src={answer.authorAvatar} sx={{ width: 36, height: 36, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                {answer.authorName}
              </Typography>
              {answer.isInstructor && (
                <Chip
                  label="Instructor"
                  size="small"
                  icon={<SchoolIcon sx={{ fontSize: "12px !important", color: "brand.main !important" }} />}
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    bgcolor: "background.muted",
                    color: "brand.dark",
                    border: "1px solid",
                    borderColor: "brand.light",
                    "& .MuiChip-icon": { ml: 0.5 },
                  }}
                />
              )}
              {answer.isTopAnswer && (
                <Chip
                  label="Top Answer"
                  size="small"
                  icon={<WorkspacePremiumIcon sx={{ fontSize: "12px !important", color: "success.main !important" }} />}
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    bgcolor: "success.lighter",
                    color: "success.dark",
                    border: "1px solid",
                    borderColor: "success.light",
                    "& .MuiChip-icon": { ml: 0.5 },
                  }}
                />
              )}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {/* Upvote */}
              <Stack direction="row" alignItems="center" spacing={0.3}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                  {upvoteCount}
                </Typography>
                <IconButton
                  size="small"
                  onClick={handleUpvote}
                  sx={{
                    p: 0.4,
                    color: upvoted ? "brand.main" : "grey.400",
                    "&:hover": { color: "brand.main", bgcolor: "background.muted" },
                  }}
                >
                  {upvoted ? (
                    <ThumbUpIcon sx={{ fontSize: 15 }} />
                  ) : (
                    <ThumbUpOutlinedIcon sx={{ fontSize: 15 }} />
                  )}
                </IconButton>
              </Stack>
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ p: 0.4, color: "grey.400", "&:hover": { color: "grey.700" } }}
              >
                <MoreVertIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          </Stack>

          <Typography variant="caption" color="text.disabled" sx={{ mb: 1, display: "block" }}>
            {formatRelativeTime(answer.createdAt)}
          </Typography>

          {/* Answer body — render HTML safely */}
          <Box
            sx={{ fontSize: "0.875rem", color: "text.primary", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: answer.body }}
          />
        </Box>
      </Stack>

      {/* Answer menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 200, borderRadius: 2, boxShadow: 3 } }}
      >
        <MenuItem
          onClick={() => { onToggleTop(answer.id); setMenuAnchor(null); }}
          sx={{ fontSize: "0.875rem", py: 1 }}
        >
          {answer.isTopAnswer ? (
            <><StarOutlineIcon sx={{ fontSize: 18, mr: 1.5, color: "success.main" }} /> Unmark Top Answer</>
          ) : (
            <><WorkspacePremiumIcon sx={{ fontSize: 18, mr: 1.5, color: "success.main" }} /> Mark as Top Answer</>
          )}
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: "0.875rem", py: 1 }}>
          Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: "0.875rem", py: 1, color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default function AnswerPanel({ question }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [localAnswers, setLocalAnswers] = useState(null);
  const bottomRef = useRef(null);

  const answers = localAnswers ?? (MOCK_ANSWERS[question?.id] || []);
  const topAnswers = answers.filter((a) => a.isTopAnswer).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const otherAnswers = answers.filter((a) => !a.isTopAnswer).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  function handleToggleTop(answerId) {
    const base = localAnswers ?? (MOCK_ANSWERS[question?.id] || []);
    setLocalAnswers(base.map((a) => a.id === answerId ? { ...a, isTopAnswer: !a.isTopAnswer } : a));
  }

  function handlePostReply() {
    if (!replyText.trim()) return;
    const newAnswer = {
      id: Date.now(),
      questionId: question.id,
      body: `<p>${replyText.trim()}</p>`,
      isTopAnswer: false,
      upvoteCount: 0,
      authorName: "Instructor",
      authorAvatar: "https://i.pravatar.cc/40?img=33",
      isInstructor: true,
      createdAt: new Date().toISOString(),
    };
    const base = localAnswers ?? (MOCK_ANSWERS[question?.id] || []);
    setLocalAnswers([...base, newAnswer]);
    setReplyText("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  if (!question) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.alt",
        }}
      >
        <ChatBubbleOutlineIcon sx={{ fontSize: 56, color: "grey.300", mb: 2 }} />
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Select a question to view answers
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
          Click any question on the left to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.disabled">
                {question.courseTitle}
                {question.lectureName && ` · ${question.lectureName}`}
              </Typography>
              {question.isFeatured && (
                <Chip
                  label="Featured"
                  size="small"
                  icon={<StarIcon sx={{ fontSize: "11px !important", color: "warning.main !important" }} />}
                  sx={{
                    height: 16,
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    bgcolor: "warning.lighter",
                    color: "warning.dark",
                    "& .MuiChip-icon": { ml: 0.3 },
                  }}
                />
              )}
            </Stack>
            <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.4 }}>
              {question.title}
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <ThumbUpOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">{question.upvoteCount}</Typography>
            </Stack>
            <IconButton
              size="small"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{ color: "grey.500", "&:hover": { color: "grey.800", bgcolor: "grey.100" } }}
            >
              <MoreVertIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* Question detail */}
        {question.detail && (
          <Box
            sx={{ mt: 1.5, fontSize: "0.875rem", color: "text.secondary", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: question.detail }}
          />
        )}

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
          <Avatar src={question.authorAvatar} sx={{ width: 24, height: 24 }} />
          <Typography variant="caption" color="text.disabled">
            {question.authorName} · {formatRelativeTime(question.createdAt)}
          </Typography>
        </Stack>
      </Box>

      {/* Answers list */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3 }}>
        {/* Top Answers */}
        {topAnswers.length > 0 && (
          <>
            <Box sx={{ py: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Divider sx={{ flex: 1 }} />
                <Typography variant="caption" color="success.main" fontWeight={700} sx={{ px: 1, letterSpacing: 0.5 }}>
                  ⭐ TOP ANSWERS
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Stack>
            </Box>
            {topAnswers.map((answer) => (
              <Box key={answer.id}>
                <AnswerCard answer={answer} onToggleTop={handleToggleTop} />
                <Divider />
              </Box>
            ))}
          </>
        )}

        {/* Other Answers */}
        {otherAnswers.length > 0 && (
          <>
            <Box sx={{ py: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Divider sx={{ flex: 1 }} />
                <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ px: 1, letterSpacing: 0.5 }}>
                  {answers.length} {answers.length === 1 ? "ANSWER" : "ANSWERS"}
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Stack>
            </Box>
            {otherAnswers.map((answer) => (
              <Box key={answer.id}>
                <AnswerCard answer={answer} onToggleTop={handleToggleTop} />
                <Divider />
              </Box>
            ))}
          </>
        )}

        {answers.length === 0 && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 36, color: "grey.300", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No answers yet. Be the first to reply!
            </Typography>
          </Box>
        )}

        <div ref={bottomRef} />
      </Box>

      {/* Reply Box */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-end">
          <Avatar src="https://i.pravatar.cc/40?img=33" sx={{ width: 36, height: 36, flexShrink: 0, mb: 0.3 }} />
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            placeholder="Post a public answer..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handlePostReply();
              }
            }}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "background.surface",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "brand.main",
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handlePostReply}
            disabled={!replyText.trim()}
            sx={{
              flexShrink: 0,
              bgcolor: "brand.main",
              "&:hover": { bgcolor: "brand.dark" },
              "&:disabled": { bgcolor: "grey.300" },
              borderRadius: 2,
              px: 2,
              py: 1,
              minWidth: "auto",
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </Button>
        </Stack>
      </Box>

      {/* Header 3-dot menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 210, borderRadius: 2, boxShadow: 3 } }}
      >
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: "0.875rem", py: 1 }}>
          <StarIcon sx={{ fontSize: 18, mr: 1.5, color: "warning.main" }} />
          {question.isFeatured ? "Unmark Featured" : "Mark as Featured"}
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: "0.875rem", py: 1 }}>
          Mark as Unread
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: "0.875rem", py: 1 }}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: "0.875rem", py: 1, color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
