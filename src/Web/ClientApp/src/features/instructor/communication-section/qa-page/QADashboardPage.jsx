import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  TextField,
  InputAdornment,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import MainCard from "../../../../components/instructor-layout/MainCard";
import PageTitle from "../../../../components/PageTitle";
import QuestionListPanel from "./components/QuestionListPanel";
import AnswerPanel from "./components/AnswerPanel";
import useGetCoursesAuthor from "../../../../hooks/course-hooks/useGetCoursesAuthor";
import useGetInstructorQuestions from "../../../../hooks/course-qa-hooks/useGetInstructorQuestions";

const FILTER_OPTIONS = [
  { value: "all", label: "All Questions" },
  { value: "unread", label: "Unread" },
  { value: "noAnswers", label: "No Answers" },
  { value: "noTopAnswer", label: "No Top Answer" },
  { value: "noInstructorAnswer", label: "No Instructor Answer" },
  { value: "featured", label: "Featured" },
];

const SORT_OPTIONS = [
  { value: "newestFirst", label: "Newest First" },
  { value: "oldestFirst", label: "Oldest First" },
  { value: "mostUpvoted", label: "Most Upvoted" },
];

export default function QADashboardPage() {
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [filterBy, setFilterBy] = useState("unread");
  const [sortBy, setSortBy] = useState("newestFirst");
  const [searchText, setSearchText] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [page, setPage] = useState(1);

  const isSmall = useMediaQuery("(max-width:900px)");

  // Fetch instructor's courses for the dropdown
  const { data: coursesData } = useGetCoursesAuthor("", 0, 1, 100);
  const courses = useMemo(() => {
    const items = coursesData?.items ?? [];
    return [{ id: null, title: "All courses" }, ...items.map((c) => ({ id: c.id, title: c.title }))];
  }, [coursesData]);

  // Fetch questions from API
  const { data: questionsData, isLoading } = useGetInstructorQuestions({
    courseId: selectedCourseId ?? undefined,
    searchText: committedSearch || undefined,
    sortBy,
    filterBy,
    pageNumber: page,
    pageSize: 20,
  });

  const questions = questionsData?.items ?? [];
  const totalCount = questionsData?.totalCount ?? 0;
  const unansweredCount = questions.filter((q) => q.answerCount === 0).length;
  const unreadCount = questions.filter((q) => !q.isRead).length;

  function handleSearchKeyDown(e) {
    if (e.key === "Enter") {
      setCommittedSearch(searchText);
      setPage(1);
    }
  }

  return (
    <MainCard>
      {/* Page header */}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{ mb: 3 }}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <PageTitle title="Q&A" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage student questions across your courses
          </Typography>
        </Box>

        {/* Quick stats */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <StatChip label="Total" value={isLoading ? "…" : totalCount} />
          <StatChip label="Unanswered" value={isLoading ? "…" : unansweredCount} />
          <StatChip label="Unread" value={isLoading ? "…" : unreadCount} />
        </Stack>
      </Stack>

      {/* Toolbar */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mb: 2 }}
        flexWrap="wrap"
        gap={1}
      >
        {/* Course selector */}
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <Select
            value={selectedCourseId ?? "all"}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedCourseId(val === "all" ? null : val);
              setSelectedQuestion(null);
              setPage(1);
            }}
            displayEmpty
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.light" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
              fontWeight: 600,
            }}
          >
            {courses.map((c) => (
              <MenuItem key={c.id ?? "all"} value={c.id ?? "all"} sx={{ fontSize: "0.875rem" }}>
                {c.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Filter */}
        <FormControl size="small" sx={{ minWidth: 190 }}>
          <Select
            value={filterBy}
            onChange={(e) => { setFilterBy(e.target.value); setSelectedQuestion(null); setPage(1); }}
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.light" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
            }}
          >
            {FILTER_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.875rem" }}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort */}
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <Select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "brand.light" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "brand.main" },
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.875rem" }}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Search + button */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1, minWidth: 180 }}>
          <TextField
            size="small"
            placeholder="Search questions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "background.paper",
                "& fieldset": { borderColor: "divider" },
                "&:hover fieldset": { borderColor: "brand.light" },
                "&.Mui-focused fieldset": { borderColor: "brand.main" },
              },
            }}
          />
          <IconButton
            onClick={() => { setCommittedSearch(searchText); setPage(1); }}
            sx={{
              bgcolor: "brand.main",
              color: "white",
              borderRadius: 2,
              width: 36,
              height: 36,
              flexShrink: 0,
              "&:hover": { bgcolor: "brand.dark" },
            }}
          >
            <SearchIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Stack>

      {/* 2-Panel Layout */}
      <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 300px)",
          minHeight: 500,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "background.paper",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {/* Left Panel */}
        <Box
          sx={{
            width: isSmall ? "100%" : "38%",
            maxWidth: isSmall ? "100%" : 380,
            flexShrink: 0,
            display: isSmall && selectedQuestion ? "none" : "flex",
            flexDirection: "column",
            borderRight: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Panel header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "background.alt",
              flexShrink: 0,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <QuestionAnswerRoundedIcon sx={{ fontSize: 18, color: "brand.main" }} />
              <Typography variant="body2" fontWeight={700} color="text.primary">
                Questions
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <QuestionListPanel
              questions={questions}
              isLoading={isLoading}
              selectedQuestion={selectedQuestion}
              onSelectQuestion={setSelectedQuestion}
            />
          </Box>
        </Box>

        {/* Right Panel */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
            display: isSmall && !selectedQuestion ? "none" : "flex",
            flexDirection: "column",
          }}
        >
          <AnswerPanel
            question={selectedQuestion}
            onQuestionUpdate={(updatedQuestion) => setSelectedQuestion(updatedQuestion)}
            onQuestionDeleted={() => setSelectedQuestion(null)}
          />
        </Box>
      </Box>
    </MainCard>
  );
}

function StatChip({ label, value }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.6,
        borderRadius: 1.5,
        bgcolor: "background.alt",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 0.75,
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );
}
