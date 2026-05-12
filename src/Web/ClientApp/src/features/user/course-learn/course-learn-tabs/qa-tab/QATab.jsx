import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
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
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleUpTwoToneIcon from '@mui/icons-material/ArrowCircleUpTwoTone';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { formatTimeAgo, stripHtml, buildItemLabelMap } from "../../../../../utils/helpers";
import useGetCourseQuestions from "../../../../../hooks/course-qa-hooks/useGetCourseQuestions";
import useGetLearningSidebar from "../../../../../hooks/course-progress-hooks/useGetLearningSidebar";
import useToggleQuestionUpvote from "../../../../../hooks/course-qa-hooks/useToggleQuestionUpvote";
import CustomPagination from "../../../../../components/pagination/CustomPagination";
import { QuestionDetailView } from "./QuestionDetailView";
import AskQuestionView from "./AskQuestionView";


function QuestionCard({ question, lectureName, onSelect }) {
  const navigate = useNavigate();
  const toggleUpvote = useToggleQuestionUpvote();

  // Optimistic local state — initialised from API data
  const [upvoted, setUpvoted] = useState(question.hasUpvoted ?? false);
  const [upvoteCount, setUpvoteCount] = useState(question.upvoteCount);

  function handleUpvote(e) {
    e.stopPropagation();
    // Optimistic update
    const wasUpvoted = upvoted;
    setUpvoted(!wasUpvoted);
    setUpvoteCount((p) => wasUpvoted ? p - 1 : p + 1);

    toggleUpvote.mutate(question.id, {
      onSuccess: (data) => {
        // Reconcile with server response
        if (data?.result) {
          setUpvoteCount(data.result.upvoteCount);
          setUpvoted(data.result.hasUpvoted);
        }
      },
      onError: () => {
        // Rollback on error
        setUpvoted(wasUpvoted);
        setUpvoteCount((p) => wasUpvoted ? p + 1 : p - 1);
      },
    });
  }

  function handleChatClick(e) {
    e.stopPropagation();
    onSelect(question);
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        py: 3,
        px: 2,
        mx: -2,
        borderRadius: 2,
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
              sx={{ color: "brand.dark", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/profile/${question.createdBy}`, "_blank");
              }}
            >
              {question.authorName}
            </Typography>
            {lectureName && (
              <>
                <Typography variant="caption" color="text.disabled">·</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "brand.dark" }}
                >
                  {lectureName}
                </Typography>
              </>
            )}
            <Typography variant="caption" color="text.disabled">·</Typography>
            <Typography variant="caption" color="text.disabled">{formatTimeAgo(question.created)}</Typography>
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

export default function QATab({ courseId, currentItem }) {
  const currentItemId = currentItem?.itemId ?? null;
  const currentLectureName = currentItem?.title ?? null;

  // ── Sidebar data for lecture label lookup ──
  const { data: sidebarData } = useGetLearningSidebar(Number(courseId));
  const itemLabelMap = useMemo(() => buildItemLabelMap(sidebarData), [sidebarData]);

  // "list" | "detail" | "ask"
  const [view, setView] = useState("list");
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [lectureFilter, setLectureFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [filterBy, setFilterBy] = useState("all");
  const [questionsPage, setQuestionsPage] = useState(1);
  const PAGE_SIZE = 15;

  // ── Fetch questions from API (server-side filter + sort + paginate) ──
  const { data: questionsData, isLoading, isError } = useGetCourseQuestions({
    courseId: Number(courseId),
    itemId: lectureFilter === "current" ? currentItemId : undefined,
    sortBy,
    filterBy,
    searchText: committedSearch || undefined,
    pageNumber: questionsPage,
    pageSize: PAGE_SIZE,
  });

  const allQuestions = questionsData?.items ?? [];
  const totalPages = questionsData?.totalPages ?? 1;

  const featured = allQuestions.filter((q) => q.isFeatured);
  const all = allQuestions.filter((q) => !q.isFeatured);

  function handleSelectQuestion(q) {
    setSelectedQuestion(q);
    setView("detail");
  }

  function handleFilterChange(setter) {
    return (value) => { setter(value); setQuestionsPage(1); };
  }

  function handleSearch() {
    setCommittedSearch(searchText);
    setQuestionsPage(1);
  }

  function handleSearchKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  function handleClearSearch() {
    setSearchText("");
    setCommittedSearch("");
    setQuestionsPage(1);
  }

  function handleQuestionPosted() {
    setQuestionsPage(1);
    setView("list");
  }

  // ── Ask view ──
  if (view === "ask") {
    return (
      <AskQuestionView
        courseId={Number(courseId)}
        itemId={currentItemId}
        onBack={() => setView("list")}
        onSuccess={handleQuestionPosted}
        currentLectureName={currentLectureName}
      />
    );
  }

  // ── Detail view ──
  if (view === "detail" && selectedQuestion) {
    return (
      <QuestionDetailView
        question={selectedQuestion}
        lectureName={itemLabelMap[selectedQuestion.itemId] ?? null}
        onBack={() => { setView("list"); setSelectedQuestion(null); }}
      />
    );
  }

  // ── List view ──
  if (isLoading) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress size={32} sx={{ color: "brand.main" }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="body2" color="error">Failed to load questions. Please try again.</Typography>
      </Box>
    );
  }

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
          onKeyDown={handleSearchKeyDown}
          InputProps={{
            endAdornment: searchText ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch} sx={{ color: "grey.400" }}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.9rem",
              "& fieldset": { borderColor: "divider" },
              "&:hover fieldset": { borderColor: "brand.main" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
            },
          }}
        />
        {/* Search icon button */}
        <IconButton
          onClick={handleSearch}
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
              onChange={(e) => handleFilterChange(setLectureFilter)(e.target.value)}
              sx={{
                fontSize: "0.82rem", borderRadius: 1.5, minWidth: 200,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
              }}
            >
              <MenuItem value="all" sx={{ fontSize: "0.82rem" }}>All lectures</MenuItem>
              <MenuItem value="current" sx={{ fontSize: "0.82rem" }}>
                Current lecture
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>Sort by:</Typography>
          <FormControl size="small">
            <Select
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy)(e.target.value)}
              sx={{
                fontSize: "0.82rem", borderRadius: 1.5, minWidth: 180,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
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
              onChange={(e) => handleFilterChange(setFilterBy)(e.target.value)}
              displayEmpty
              sx={{
                fontSize: "0.82rem",
                borderRadius: 1.5,
                minWidth: 220,
                fontWeight: 600,
                color: "brand.main",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
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
            <QuestionCard
              key={q.id}
              question={q}
              lectureName={itemLabelMap[q.itemId] ?? null}
              onSelect={handleSelectQuestion}
            />
          ))}
        </Box>
      )}

      {featured.length > 0 && all.length > 0 && <Box sx={{ mt: 3 }} />}

      {/* All questions */}
      {all.length > 0 && (
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography variant="body1" fontWeight={700} color="text.primary">
              All questions in this course
            </Typography>
            <Typography variant="body2" color="text.disabled">({all.length})</Typography>
          </Stack>
          {all.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              lectureName={itemLabelMap[q.itemId] ?? null}
              onSelect={handleSelectQuestion}
            />
          ))}
        </Box>
      )}

      {/* Empty states */}
      {featured.length === 0 && all.length === 0 && (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <HelpOutlineIcon sx={{ fontSize: 56, color: "grey.600", mb: 2 }} />
          <Typography variant="body1" fontWeight={600} color="text.secondary">
            {searchText || filterBy !== "all" || lectureFilter !== "all" ? "No questions found" : "No questions yet"}
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, mb: 3 }}>
            {searchText || filterBy !== "all" || lectureFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Ask the first question and start the discussion!"}
          </Typography>
        </Box>
      )}

      {/* Questions pagination */}
      {totalPages > 1 && (
        <CustomPagination
          count={totalPages}
          page={questionsPage}
          onChange={(_, value) => setQuestionsPage(value)}
        />
      )}

      {/* Ask a new question — pinned at bottom */}
      <Box sx={{ mt: 4, pt: 2 }}>
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
