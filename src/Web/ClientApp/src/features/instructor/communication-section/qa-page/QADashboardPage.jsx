import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Chip,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import MainCard from "../../../../components/instructor-layout/MainCard";
import PageTitle from "../../../../components/PageTitle";
import QuestionListPanel from "./components/QuestionListPanel";
import AnswerPanel from "./components/AnswerPanel";
import { MOCK_COURSES, MOCK_QUESTIONS } from "./mockData";

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
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("newestFirst");
  const [searchText, setSearchText] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const isSmall = useMediaQuery("(max-width:900px)");

  // Stats derived from mock
  const totalQ = MOCK_QUESTIONS.filter(
    (q) => selectedCourseId === null || q.courseId === selectedCourseId
  ).length;
  const unansweredQ = MOCK_QUESTIONS.filter(
    (q) =>
      (selectedCourseId === null || q.courseId === selectedCourseId) &&
      q.answerCount === 0
  ).length;
  const unreadQ = MOCK_QUESTIONS.filter(
    (q) =>
      (selectedCourseId === null || q.courseId === selectedCourseId) && !q.isRead
  ).length;

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
          <StatChip label="Total" value={totalQ} />
          <StatChip label="Unanswered" value={unansweredQ} />
          <StatChip label="Unread" value={unreadQ} />
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
            {MOCK_COURSES.map((c) => (
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
            onChange={(e) => { setFilterBy(e.target.value); setSelectedQuestion(null); }}
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
            onChange={(e) => setSortBy(e.target.value)}
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

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search questions..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            minWidth: 180,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: "background.paper",
              "& fieldset": { borderColor: "divider" },
              "&:hover fieldset": { borderColor: "brand.light" },
              "&.Mui-focused fieldset": { borderColor: "brand.main" },
            },
          }}
        />
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
              selectedCourseId={selectedCourseId}
              selectedQuestion={selectedQuestion}
              onSelectQuestion={setSelectedQuestion}
              filterBy={filterBy}
              sortBy={sortBy}
              searchText={searchText}
            />
          </Box>
        </Box>

        {/* Right Panel */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: isSmall && !selectedQuestion ? "none" : "flex",
            flexDirection: "column",
          }}
        >
          <AnswerPanel question={selectedQuestion} />
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
