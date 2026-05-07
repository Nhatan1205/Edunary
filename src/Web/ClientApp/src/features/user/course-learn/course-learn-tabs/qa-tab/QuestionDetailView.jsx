import { useState, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Button,
  TextField,
  Chip,
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleUpTwoToneIcon from '@mui/icons-material/ArrowCircleUpTwoTone';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import SendIcon from "@mui/icons-material/Send";
import { STUDENT_MOCK_ANSWERS, CURRENT_USER } from "./mockQAData";

function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

// Single answer row
function AnswerRow({ answer }) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(answer.upvoteCount);
  const [menuAnchor, setMenuAnchor] = useState(null);

  return (
    <Box
      sx={{
        py: 3,
        px: 0,
        bgcolor: answer.isTopAnswer ? "background.muted" : "transparent",
        borderRadius: answer.isTopAnswer ? 2 : 0,
        mb: answer.isTopAnswer ? 2 : 1,
        px: answer.isTopAnswer ? 2 : 0,
        borderLeftColor: "brand.light",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar src={answer.authorAvatar} sx={{ width: 36, height: 36, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Author line */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={0.8} flexWrap="wrap">
              <Typography
                variant="body2"
                component="span"
                sx={{ fontWeight: 700, color: answer.isInstructor ? "brand.dark" : "text.primary", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
              >
                {answer.authorName}
              </Typography>
              {answer.isInstructor && (
                <Typography variant="caption" color="text.secondary" component="span">
                  — Instructor
                </Typography>
              )}
              {answer.isTopAnswer && (
                <Chip
                  label="Answer"
                  size="small"
                  icon={<StarIcon sx={{ fontSize: "11px !important", color: "warning.dark !important" }} />}
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    bgcolor: "warning.lighter",
                    color: "warning.darker",
                    border: "none",
                    "& .MuiChip-icon": { ml: 0.5 },
                  }}
                />
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{upvoteCount}</Typography>
              <IconButton
                size="small"
                onClick={() => { setUpvoted((p) => !p); setUpvoteCount((p) => upvoted ? p - 1 : p + 1); }}
                sx={{
                  p: 0.5,
                  color: "grey.500",
                }}
              >
                {upvoted ? <ArrowCircleUpTwoToneIcon sx={{ fontSize: 20 }} /> : <ArrowCircleUpIcon sx={{ fontSize: 20 }} />}
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ p: 0.5, color: "grey.500", "&:hover": { color: "grey.800" } }}
              >
                <MoreVertIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          </Stack>

          <Typography variant="caption" color="text.disabled" sx={{ display: "block", mb: 1 }}>
            {formatRelativeTime(answer.createdAt)}
          </Typography>

          {/* Answer body (HTML) */}
          <Box
            sx={{ fontSize: "0.875rem", color: "text.primary", lineHeight: 1.75, "& img": { maxWidth: "100%", borderRadius: 1, mt: 1 }, "& pre": { bgcolor: "grey.100", p: 1.5, borderRadius: 1, fontSize: "0.8rem", overflowX: "auto" }, "& code": { bgcolor: "grey.100", px: 0.5, borderRadius: 0.5, fontSize: "0.82rem" } }}
            dangerouslySetInnerHTML={{ __html: answer.body }}
          />
        </Box>
      </Stack>

      {/* 3-dot menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 160, borderRadius: 2, boxShadow: 3 } }}
      >
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: "0.875rem" }}>Edit</MenuItem>
        <Divider />
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ fontSize: "0.875rem", color: "error.main" }}>Delete</MenuItem>
      </Menu>
    </Box>
  );
}

// Answer thread view (image 2)
export function QuestionDetailView({ question, onBack }) {
  const [replyText, setReplyText] = useState("");
  const [localAnswers, setLocalAnswers] = useState(null);

  const baseAnswers = STUDENT_MOCK_ANSWERS[question.id] || [];
  const answers = localAnswers ?? baseAnswers;

  const topAnswers = answers.filter((a) => a.isTopAnswer).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const otherAnswers = answers.filter((a) => !a.isTopAnswer).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  function handlePost() {
    if (!replyText.trim()) return;
    const newAnswer = {
      id: Date.now(),
      questionId: question.id,
      body: `<p>${replyText.trim()}</p>`,
      isTopAnswer: false,
      upvoteCount: 0,
      authorName: CURRENT_USER.name,
      authorAvatar: CURRENT_USER.avatar,
      isInstructor: false,
      createdAt: new Date().toISOString(),
    };
    setLocalAnswers([...(localAnswers ?? baseAnswers), newAnswer]);
    setReplyText("");
  }

  return (
    <Box>
      {/* Back button */}
      <Box sx={{ mb: 2.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            textTransform: "none",
            borderColor: "brand.main",
            color: "brand.main",
            fontWeight: 600,
            borderRadius: 2,
            fontSize: "0.8rem",
            py: 1,
            px: 2,
            "&:hover": { bgcolor: "background.muted", borderColor: "brand.dark" },
          }}
        >
          Back to All Questions
        </Button>
      </Box>

      {/* Question header card */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 2.5,
          pb: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
          <Avatar src={question.authorAvatar} sx={{ width: 44, height: 44, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, color: "text.primary", mb: 0.8 }}>
              {question.title}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.6} flexWrap="wrap">
              <Typography
                variant="caption"
                sx={{ color: "brand.dark", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
              >
                {question.authorName}
              </Typography>
              {question.lectureName && (
                <>
                  <Typography variant="caption" color="text.disabled">·</Typography>
                  <Typography variant="caption" sx={{ color: "brand.dark", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
                    {question.lectureName}
                  </Typography>
                </>
              )}
              <Typography variant="caption" color="text.disabled">·</Typography>
              <Typography variant="caption" color="text.disabled">{formatRelativeTime(question.createdAt)}</Typography>
            </Stack>
            {question.detail && (
              <Typography
                variant="body2"
                sx={{ mt: 1, color: "brand.dark", cursor: "pointer", "&:hover": { textDecoration: "underline" }, fontSize: "0.875rem" }}
              >
                {stripHtml(question.detail).slice(0, 80)}{stripHtml(question.detail).length > 80 ? "..." : ""}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Upvote on question */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0, ml: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{question.upvoteCount}</Typography>
          <IconButton size="small" sx={{ p: 0.5, color: "grey.500", "&:hover": { color: "brand.main" } }}>
            <ArrowCircleUpIcon sx={{ fontSize: 22 }} />
          </IconButton>
          <IconButton size="small" sx={{ p: 0.5, color: "grey.500", "&:hover": { color: "grey.800" } }}>
            <MoreVertIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Replies count + following label */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={700} color="text.primary">
          {answers.length} {answers.length === 1 ? "reply" : "replies"}
        </Typography>
      </Stack>

      {/* Top Answers first */}
      {topAnswers.map((a) => <AnswerRow key={a.id} answer={a} />)}
      {topAnswers.length > 0 && otherAnswers.length > 0 && <Divider sx={{ my: 1 }} />}
      {otherAnswers.map((a) => <AnswerRow key={a.id} answer={a} />)}

      {answers.length === 0 && (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">No answers yet. Be the first to reply!</Typography>
        </Box>
      )}

      {/* Reply input */}
      <Box sx={{ mt: 3, pt: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-end">
          <Avatar src={CURRENT_USER.avatar} sx={{ width: 34, height: 34, flexShrink: 0, mb: 0.3 }} />
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            placeholder="Post a public answer..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePost(); } }}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: "0.875rem",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handlePost}
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
    </Box>
  );
}
