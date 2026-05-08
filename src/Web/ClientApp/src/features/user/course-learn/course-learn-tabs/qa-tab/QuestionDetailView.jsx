import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Button,
  Chip,
  Divider,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleUpTwoToneIcon from '@mui/icons-material/ArrowCircleUpTwoTone';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import SendIcon from "@mui/icons-material/Send";
import { formatTimeAgo, stripHtml } from "../../../../../utils/helpers";
import TextEditor from "../../../../../components/TextEditor";
import useGetCourseAnswers from "../../../../../hooks/course-qa-hooks/useGetCourseAnswers";
import useCreateCourseAnswer from "../../../../../hooks/course-qa-hooks/useCreateCourseAnswer";
import CustomPagination from "../../../../../components/pagination/CustomPagination";


// Single answer row
function AnswerRow({ answer }) {
  const navigate = useNavigate();
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
                onClick={() => navigate(`/profile/${answer.createdBy}`)}
                sx={{ fontWeight: 700, color: answer.isInstructor ? "brand.dark" : "text.primary", cursor: "pointer", textDecoration: "underline" }}
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
            {formatTimeAgo(answer.created)}
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

export function QuestionDetailView({ question, lectureName, onBack }) {
  const navigate = useNavigate();
  const [answersPage, setAnswersPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: answersData, isLoading: answersLoading } = useGetCourseAnswers(question?.id, answersPage, PAGE_SIZE);
  const answers = answersData?.items ?? [];
  const totalPages = answersData?.totalPages ?? 1;
  const totalCount = answersData?.totalCount ?? 0;
  const createAnswer = useCreateCourseAnswer();

  // top answers first (already sorted by backend), then others
  const topAnswers = answers.filter((a) => a.isTopAnswer);
  const otherAnswers = answers.filter((a) => !a.isTopAnswer);

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: { body: "" },
  });
  const bodyValue = watch("body");
  const canPost = stripHtml(bodyValue).trim().length > 0 && !createAnswer.isPending;

  function onSubmitReply({ body }) {
    createAnswer.mutate(
      { questionId: question.id, body },
      {
        onSuccess: () => {
          reset({ body: "" });
          setAnswersPage(1);
        }
      }
    );
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
                onClick={() => window.open(`/profile/${question.createdBy}`, "_blank")}
                sx={{ color: "brand.dark", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
              >
                {question.authorName}
              </Typography>
              {lectureName && (
                <>
                  <Typography variant="caption" color="text.disabled">·</Typography>
                  <Typography variant="caption" sx={{ color: "brand.dark" }}>
                    {lectureName}
                  </Typography>
                </>
              )}
              <Typography variant="caption" color="text.disabled">·</Typography>
              <Typography variant="caption" color="text.disabled">{formatTimeAgo(question.created)}</Typography>
            </Stack>
            {/* Full question detail as WYSIWYG HTML */}
            {question.detail && (
              <Box
                sx={{
                  mt: 1.5,
                  fontSize: "0.9rem",
                  color: "text.primary",
                  lineHeight: 1.8,
                  "& img": { maxWidth: "100%", borderRadius: 1, mt: 1 },
                  "& pre": { bgcolor: "grey.100", p: 1.5, borderRadius: 1, fontSize: "0.8rem", overflowX: "auto" },
                  "& code": { bgcolor: "grey.100", px: 0.5, borderRadius: 0.5, fontSize: "0.82rem" },
                  "& p": { mt: 0.5, mb: 0 },
                }}
                dangerouslySetInnerHTML={{ __html: question.detail }}
              />
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

      {/* Replies count */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={700} color="text.primary">
          {answersLoading ? "Loading..." : `${totalCount} ${totalCount === 1 ? "reply" : "replies"}`}
        </Typography>
      </Stack>

      {/* Answers loading */}
      {answersLoading && (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <CircularProgress size={28} sx={{ color: "brand.main" }} />
        </Box>
      )}

      {/* Top Answers first */}
      {!answersLoading && topAnswers.map((a) => <AnswerRow key={a.id} answer={a} />)}
      {!answersLoading && topAnswers.length > 0 && otherAnswers.length > 0 && <Divider sx={{ my: 1 }} />}
      {!answersLoading && otherAnswers.map((a) => <AnswerRow key={a.id} answer={a} />)}

      {!answersLoading && answers.length === 0 && (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">No answers yet. Be the first to reply!</Typography>
        </Box>
      )}

      {/* Answers pagination */}
      {!answersLoading && totalPages > 1 && (
        <CustomPagination
          count={totalPages}
          page={answersPage}
          onChange={(_, value) => setAnswersPage(value)}
        />
      )}

      {/* Reply form using TextEditor + RHF */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmitReply)}
        sx={{ mt: 3, pt: 2.5, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
          Post a public answer
        </Typography>
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            overflow: "hidden",
            mb: 1.5,
            "&:focus-within": { borderColor: "brand.main" },
            transition: "border-color 0.15s",
          }}
        >
          <Controller
            name="body"
            control={control}
            render={({ field }) => (
              <TextEditor
                value={field.value}
                onChange={field.onChange}
                buttons={["bold", "italic", "|", "link", "image", "|", "source"]}
              />
            )}
          />
        </Box>
        <Button
          type="submit"
          variant="contained"
          disabled={!canPost}
          endIcon={<SendIcon sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: "brand.main",
            "&:hover": { bgcolor: "brand.dark" },
            "&:disabled": { bgcolor: "brand.light", color: "white", cursor: "not-allowed", pointerEvents: "auto" },
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            py: 1,
          }}
        >
          {createAnswer.isPending ? "Posting..." : "Post Answer"}
        </Button>
      </Box>
    </Box>
  );
}
