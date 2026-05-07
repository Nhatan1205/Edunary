import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleUpTwoToneIcon from '@mui/icons-material/ArrowCircleUpTwoTone';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { STUDENT_MOCK_QUESTIONS, CURRENT_USER } from "./mockQAData";
import { QuestionDetailView } from "./QuestionDetailView";
import AskQuestionView from "./AskQuestionView";

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

function getRecommendedScore(q) {
  const diff = Date.now() - new Date(q.createdAt).getTime();
  const hrs = diff / 3600000;
  const recency = hrs < 24 ? 5 : hrs < 168 ? 3 : hrs < 720 ? 1 : 0;
  return q.upvoteCount * 2 + q.answerCount * 1.5 + recency;
}

// ── Question card row ──────────────────────────────────────────────────────
function QuestionCard({ question, onSelect, currentItemId }) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(question.upvoteCount);

  function handleUpvote(e) {
    e.stopPropagation();
    setUpvoted((p) => !p);
    setUpvoteCount((p) => (upvoted ? p - 1 : p + 1));
  }

  function handleChatClick(e) {
    e.stopPropagation();
    onSelect(question);
  }

  return (
    <Box
      onClick={() => onSelect(question)}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        py: 3,
        px: 2,
        mx: -2,
        borderRadius: 2,
        cursor: "pointer",
        borderBottom: "1px solid",
        borderColor: "divider",
        transition: "background 0.15s",
        "&:hover": { bgcolor: "grey.50" },
      }}
    >
      {/* Left */}
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ flex: 1, minWidth: 0, pr: 2 }}>
        <Avatar src={question.authorAvatar} sx={{ width: 38, height: 38, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography
              className="qa-title"
              variant="body2"
              sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.4 }}
            >
              {question.title}
            </Typography>
            {question.isFeatured && (
              <Chip
                label="Featured"
                size="small"
                icon={<StarIcon sx={{ fontSize: "11px !important", color: "warning.main !important" }} />}
                sx={{
                  height: 18,
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  bgcolor: "warning.lighter",
                  color: "warning.darker",
                  "& .MuiChip-icon": { ml: 0.3 },
                }}
              />
            )}
          </Stack>

          {question.detail && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.3, fontSize: "0.82rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}
            >
              {stripHtml(question.detail)}
            </Typography>
          )}

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.8 }} flexWrap="wrap">
            <Typography
              variant="caption"
              sx={{ color: "brand.dark", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
              onClick={(e) => e.stopPropagation()}
            >
              {question.authorName}
            </Typography>
            {question.lectureName && (
              <>
                <Typography variant="caption" color="text.disabled">·</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "brand.dark", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {question.lectureName}
                </Typography>
              </>
            )}
            <Typography variant="caption" color="text.disabled">·</Typography>
            <Typography variant="caption" color="text.disabled">{formatRelativeTime(question.createdAt)}</Typography>
          </Stack>
        </Box>
      </Stack>

      {/* Right: upvote + chat */}
      <Stack alignItems="flex-end" spacing={1} sx={{ flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.8}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{upvoteCount}</Typography>
          <Box
            component="span"
            onClick={handleUpvote}
            sx={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: "50%",
              color: "grey.500",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {upvoted ? <ArrowCircleUpTwoToneIcon sx={{ fontSize: 22 }} /> : <ArrowCircleUpIcon sx={{ fontSize: 22 }} />}
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.8}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{question.answerCount}</Typography>
          <Box
            component="span"
            onClick={handleChatClick}
            sx={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: "50%",
              color: "grey.500",
              cursor: "pointer", transition: "all 0.15s",
              "&:hover": { color: "grey.800" },
            }}
          >
            <QuestionAnswerIcon sx={{ fontSize: 20 }} />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

// ── Main QA Tab ─────────────────────────────────────────────────────────────
export default function QATab({ courseId, currentItem }) {
  const currentItemId = currentItem?.itemId ?? null;
  const currentLectureName = currentItem?.title ?? null;

  // "list" | "detail" | "ask"
  const [view, setView] = useState("list");
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [lectureFilter, setLectureFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [filterBy, setFilterBy] = useState("all");
  const [localQuestions, setLocalQuestions] = useState(STUDENT_MOCK_QUESTIONS);

  const { featured, all } = useMemo(() => {
    let list = localQuestions.filter((q) => {
      if (lectureFilter === "current" && q.itemId !== currentItemId) return false;
      if (filterBy === "myQuestions" && q.authorName !== CURRENT_USER.name) return false;
      if (filterBy === "noResponses" && q.answerCount > 0) return false;
      if (
        searchText &&
        !q.title.toLowerCase().includes(searchText.toLowerCase()) &&
        !stripHtml(q.detail).toLowerCase().includes(searchText.toLowerCase())
      ) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "mostRecent") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "mostUpvoted") return b.upvoteCount - a.upvoteCount;
      return getRecommendedScore(b) - getRecommendedScore(a);
    });

    return {
      featured: list.filter((q) => q.isFeatured),
      all: list.filter((q) => !q.isFeatured),
    };
  }, [localQuestions, lectureFilter, filterBy, sortBy, searchText, currentItemId]);

  function handleSelectQuestion(q) {
    setSelectedQuestion(q);
    setView("detail");
  }

  function handleSubmitQuestion({ title, detail }) {
    const newQ = {
      id: Date.now(),
      courseId: Number(courseId),
      itemId: currentItemId,
      lectureName: currentLectureName,
      title,
      detail: detail || null,
      authorName: CURRENT_USER.name,
      authorAvatar: CURRENT_USER.avatar,
      answerCount: 0,
      upvoteCount: 0,
      isFeatured: false,
      isRead: true,
      createdAt: new Date().toISOString(),
    };
    setLocalQuestions((prev) => [newQ, ...prev]);
    setView("list");
  }

  // ── Ask view ──
  if (view === "ask") {
    return (
      <AskQuestionView
        onSubmit={handleSubmitQuestion}
        onBack={() => setView("list")}
        currentLectureName={currentLectureName}
      />
    );
  }

  // ── Detail view ──
  if (view === "detail" && selectedQuestion) {
    return (
      <QuestionDetailView
        question={selectedQuestion}
        onBack={() => { setView("list"); setSelectedQuestion(null); }}
      />
    );
  }

  // ── List view ──
  const totalCount = featured.length + all.length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Search bar row */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search all course questions"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            endAdornment: searchText ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchText("")} sx={{ color: "grey.400" }}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.9rem",
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
            },
          }}
        />
        {/* Search icon button */}
        <IconButton
          onClick={() => { }}
          sx={{
            bgcolor: "brand.main",
            color: "white",
            borderRadius: 2,
            width: 40,
            height: 40,
            flexShrink: 0,
            "&:hover": { bgcolor: "brand.dark" },
          }}
        >
          <SearchIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Stack>

      {/* Filters row */}
      <Stack direction="row" alignItems="flex-start" sx={{ mb: 2.5 }} flexWrap="wrap" gap={2}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>Filters:</Typography>
          <FormControl size="small">
            <Select
              value={lectureFilter}
              onChange={(e) => setLectureFilter(e.target.value)}
              sx={{
                fontSize: "0.82rem", borderRadius: 1.5, minWidth: 200,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
              }}
            >
              <MenuItem value="all" sx={{ fontSize: "0.82rem" }}>All lectures</MenuItem>
              <MenuItem value="current" sx={{ fontSize: "0.82rem" }}>
                Current lecture{currentLectureName ? ` (${currentLectureName})` : ""}
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>Sort by:</Typography>
          <FormControl size="small">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{
                fontSize: "0.82rem", borderRadius: 1.5, minWidth: 180,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
              }}
            >
              <MenuItem value="recommended" sx={{ fontSize: "0.82rem" }}>Sort by recommended</MenuItem>
              <MenuItem value="mostRecent" sx={{ fontSize: "0.82rem" }}>Most recent</MenuItem>
              <MenuItem value="mostUpvoted" sx={{ fontSize: "0.82rem" }}>Most upvoted</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Filter questions — brand colored border */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="caption" color="transparent" fontWeight={700} sx={{ userSelect: "none" }}>&nbsp;</Typography>
          <FormControl size="small">
            <Select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              displayEmpty
              sx={{
                fontSize: "0.82rem",
                borderRadius: 1.5,
                minWidth: 220,
                fontWeight: 600,
                color: "brand.main",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.dark" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.dark" },
                "& .MuiSvgIcon-root": { color: "brand.main" },
              }}
            >
              <MenuItem value="all" sx={{ fontSize: "0.82rem" }}>Filter questions</MenuItem>
              <MenuItem value="myQuestions" sx={{ fontSize: "0.82rem" }}>Questions I asked</MenuItem>
              <MenuItem value="noResponses" sx={{ fontSize: "0.82rem" }}>Questions without responses</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>

      {/* Featured questions */}
      {featured.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography variant="body1" fontWeight={700} color="text.primary">
              Featured questions in this course
            </Typography>
            <Typography variant="body2" color="text.disabled">({featured.length})</Typography>
          </Stack>
          {featured.map((q) => (
            <QuestionCard key={q.id} question={q} onSelect={handleSelectQuestion} currentItemId={currentItemId} />
          ))}
        </Box>
      )}

      {featured.length > 0 && all.length > 0 && <Box sx={{ mt: 3 }} />}

      {/* All questions */}
      {(featured.length === 0 || all.length > 0) && (
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography variant="body1" fontWeight={700} color="text.primary">
              All questions in this course
            </Typography>
            <Typography variant="body2" color="text.disabled">({all.length})</Typography>
          </Stack>
          {all.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <HelpOutlineIcon sx={{ fontSize: 48, color: "grey.300", mb: 1.5 }} />
              <Typography variant="body1" color="text.secondary" fontWeight={500}>No questions found</Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                {searchText ? "Try a different search term" : "Be the first to ask a question!"}
              </Typography>
            </Box>
          ) : (
            all.map((q) => (
              <QuestionCard key={q.id} question={q} onSelect={handleSelectQuestion} currentItemId={currentItemId} />
            ))
          )}
        </Box>
      )}

      {/* Global empty state */}
      {featured.length === 0 && all.length === 0 && !searchText && (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <HelpOutlineIcon sx={{ fontSize: 56, color: "grey.200", mb: 2 }} />
          <Typography variant="body1" fontWeight={600} color="text.secondary">No questions yet</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, mb: 3 }}>
            Ask the first question and start the discussion!
          </Typography>
        </Box>
      )}

      {/* Ask a new question — pinned at bottom */}
      <Box sx={{ mt: 4, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setView("ask")}
          sx={{
            borderColor: "brand.main",
            color: "brand.main",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            py: 1.2,
            fontSize: "0.95rem",
            "&:hover": { bgcolor: "background.muted", borderColor: "brand.dark", color: "brand.dark" },
          }}
        >
          Ask a new question
        </Button>
      </Box>
    </Box>
  );
}
