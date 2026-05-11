import { useState, useRef } from "react";
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
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import ArrowCircleUpTwoToneIcon from "@mui/icons-material/ArrowCircleUpTwoTone";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SchoolIcon from "@mui/icons-material/School";
import { formatTimeAgo, stripHtml } from "../../../../../utils/helpers";
import useGetCourseAnswers from "../../../../../hooks/course-qa-hooks/useGetCourseAnswers";
import useCreateCourseAnswer from "../../../../../hooks/course-qa-hooks/useCreateCourseAnswer";
import useUpdateCourseAnswer from "../../../../../hooks/course-qa-hooks/useUpdateCourseAnswer";
import useDeleteCourseAnswer from "../../../../../hooks/course-qa-hooks/useDeleteCourseAnswer";
import useUpdateCourseQuestion from "../../../../../hooks/course-qa-hooks/useUpdateCourseQuestion";
import useDeleteCourseQuestion from "../../../../../hooks/course-qa-hooks/useDeleteCourseQuestion";
import useToggleTopAnswer from "../../../../../hooks/course-qa-hooks/useToggleTopAnswer";
import useToggleAnswerUpvote from "../../../../../hooks/course-qa-hooks/useToggleAnswerUpvote";
import useToggleQuestionUpvote from "../../../../../hooks/course-qa-hooks/useToggleQuestionUpvote";
import useToggleFeatured from "../../../../../hooks/course-qa-hooks/useToggleFeatured";
import useToggleReadStatus from "../../../../../hooks/course-qa-hooks/useToggleReadStatus";
import useGetBasicUserInfor from "../../../../../hooks/auth-hooks/useGetBasicUserInfor";
import TextEditor from "../../../../../components/TextEditor";

// ── Question upvote button — key={question.id} forces re-mount on question change ──
function QuestionUpvoteButton({ question }) {
  const toggleQuestionUpvote = useToggleQuestionUpvote();
  const [upvoted, setUpvoted] = useState(question?.hasUpvoted ?? false);
  const [count, setCount] = useState(question?.upvoteCount ?? 0);

  function handleUpvote() {
    if (!question) return;
    const was = upvoted;
    setUpvoted(!was);
    setCount((p) => was ? p - 1 : p + 1);
    toggleQuestionUpvote.mutate(question.id, {
      onSuccess: (data) => { if (data?.result) { setCount(data.result.upvoteCount); setUpvoted(data.result.hasUpvoted); } },
      onError: () => { setUpvoted(was); setCount((p) => was ? p + 1 : p - 1); },
    });
  }

  return (
    <Stack direction="row" alignItems="center" spacing={0.3}>
      <Typography variant="caption" color="text.secondary">{count}</Typography>
      <Box component="span" onClick={handleUpvote}
        sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", color: "grey.500", cursor: "pointer", transition: "all 0.15s" }}>
        {upvoted ? <ArrowCircleUpTwoToneIcon sx={{ fontSize: 20 }} /> : <ArrowCircleUpIcon sx={{ fontSize: 20 }} />}
      </Box>
    </Stack>
  );
}


function AnswerCard({ answer, onToggleTop, currentUserId }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(answer.body);
  const toggleUpvote = useToggleAnswerUpvote();
  const updateAnswer = useUpdateCourseAnswer();
  const deleteAnswer = useDeleteCourseAnswer();
  const [upvoted, setUpvoted] = useState(answer.hasUpvoted ?? false);
  const [upvoteCount, setUpvoteCount] = useState(answer.upvoteCount);

  const isAuthor = currentUserId && answer.createdBy === currentUserId;

  function handleUpvote() {
    const was = upvoted;
    setUpvoted(!was);
    setUpvoteCount((p) => was ? p - 1 : p + 1);
    toggleUpvote.mutate(answer.id, {
      onSuccess: (data) => { if (data?.result) { setUpvoteCount(data.result.upvoteCount); setUpvoted(data.result.hasUpvoted); } },
      onError: () => { setUpvoted(was); setUpvoteCount((p) => was ? p + 1 : p - 1); },
    });
  }

  return (
    <Box sx={{ py: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar src={answer.authorAvatar} sx={{ width: 36, height: 36, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{answer.authorName}</Typography>
              {answer.isInstructor && (
                <Chip label="Instructor" size="small"
                  icon={<SchoolIcon sx={{ fontSize: "12px !important", color: "brand.main !important" }} />}
                  sx={{ height: 18, fontSize: "0.65rem", fontWeight: 600, bgcolor: "background.muted", color: "brand.dark", border: "1px solid", borderColor: "brand.light", "& .MuiChip-icon": { ml: 0.5 } }}
                />
              )}
              {answer.isTopAnswer && (
                <Chip label="Top Answer" size="small"
                  icon={<WorkspacePremiumIcon sx={{ fontSize: "12px !important", color: "success.main !important" }} />}
                  sx={{ height: 18, fontSize: "0.65rem", fontWeight: 600, bgcolor: "success.lighter", color: "success.dark", border: "1px solid", borderColor: "success.light", "& .MuiChip-icon": { ml: 0.5 } }}
                />
              )}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Stack direction="row" alignItems="center" spacing={0.3}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>{upvoteCount}</Typography>
                <Box component="span" onClick={handleUpvote}
                  sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", color: "grey.500", cursor: "pointer", transition: "all 0.15s" }}>
                  {upvoted ? <ArrowCircleUpTwoToneIcon sx={{ fontSize: 20 }} /> : <ArrowCircleUpIcon sx={{ fontSize: 20 }} />}
                </Box>
              </Stack>
              <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ p: 0.4, color: "grey.400", "&:hover": { color: "grey.700" } }}>
                <MoreVertIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          </Stack>

          <Typography variant="caption" color="text.disabled" sx={{ display: "block", mb: 1 }}>
            {formatTimeAgo(answer.created)}
          </Typography>

          {editing ? (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ border: "2px solid", borderColor: "brand.main", borderRadius: 1.5, overflow: "hidden", mb: 1.5 }}>
                <TextEditor value={editBody} onChange={setEditBody} buttons={["bold", "italic", "|", "link", "image", "|", "source"]} />
              </Box>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" size="small" onClick={() => { setEditing(false); setEditBody(answer.body); }}
                  sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary", borderRadius: 1 }}>Cancel</Button>
                <Button variant="contained" size="small"
                  onClick={() => updateAnswer.mutate({ answerId: answer.id, body: editBody }, { onSuccess: () => setEditing(false) })}
                  disabled={updateAnswer.isPending || stripHtml(editBody).trim().length === 0}
                  endIcon={<SendIcon sx={{ fontSize: 14 }} />}
                  sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" }, textTransform: "none", fontWeight: 700, borderRadius: 1 }}>
                  {updateAnswer.isPending ? "Saving..." : "Save"}
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box sx={{ fontSize: "0.875rem", color: "text.primary", lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: answer.body }} />
          )}
        </Box>
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 200, borderRadius: 2, boxShadow: 3 } }}>
        <MenuItem onClick={() => { onToggleTop(answer.id); setMenuAnchor(null); }} sx={{ fontSize: "0.875rem", py: 1 }}>
          {answer.isTopAnswer ? "Unmark Top Answer" : "Mark as Top Answer"}
        </MenuItem>
        {isAuthor && (
          <MenuItem onClick={() => { setEditing(true); setMenuAnchor(null); }} sx={{ fontSize: "0.875rem", py: 1 }}>Edit</MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => { deleteAnswer.mutate(answer.id); setMenuAnchor(null); }} sx={{ fontSize: "0.875rem", py: 1, color: "error.main" }}>Delete</MenuItem>
      </Menu>
    </Box>
  );
}

function ReplyBox({ questionId, onPosted }) {
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState("");
  const createAnswer = useCreateCourseAnswer();

  const canPost = stripHtml(body).trim().length > 0 && !createAnswer.isPending;

  function handlePost() {
    if (!canPost) return;
    createAnswer.mutate(
      { questionId, body },
      {
        onSuccess: () => {
          setBody("");
          setExpanded(false);
          onPosted?.();
        },
      }
    );
  }

  return (
    <Box
      sx={{
        px: 3,
        pt: expanded ? 1.5 : 0,
        pb: 1.5,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        flexShrink: 0,
        transition: "padding 0.2s",
      }}
    >
      {/* Collapsed — simple placeholder row */}
      {!expanded && (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1 }}>
          <Box
            onClick={() => setExpanded(true)}
            sx={{
              flex: 1,
              px: 2,
              py: 1,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              cursor: "text",
              color: "text.disabled",
              fontSize: "0.875rem",
              bgcolor: "background.default",
              "&:hover": { borderColor: "brand.light" },
              transition: "border-color 0.15s",
            }}
          >
            Post a public answer...
          </Box>
          <Button
            variant="contained"
            disabled
            sx={{
              flexShrink: 0,
              bgcolor: "brand.light",
              color: "white",
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
              py: 0.9,
            }}
          >
            Post
          </Button>
        </Stack>
      )}

      {/* Expanded — TextEditor */}
      {expanded && (
        <>
          <Box
            sx={{
              border: "2px solid",
              borderColor: "brand.main",
              borderRadius: 1.5,
              overflow: "hidden",
              mb: 1.5,
            }}
          >
            <TextEditor
              value={body}
              onChange={setBody}
              buttons={["bold", "italic", "|", "link", "image", "|", "source"]}
            />
          </Box>
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => { setExpanded(false); setBody(""); }}
              sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary", borderRadius: 1, px: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handlePost}
              disabled={!canPost}
              endIcon={<SendIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: "brand.main",
                "&:hover": { bgcolor: "brand.dark" },
                "&:disabled": { bgcolor: "brand.light", color: "white" },
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1,
                px: 2.5,
              }}
            >
              Post
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}

export default function AnswerPanel({ question, onQuestionDeleted }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [answersPage] = useState(1);
  const scrollRef = useRef(null);
  const { data: currentUser } = useGetBasicUserInfor();
  const currentUserId = currentUser?.userId;
  const toggleFeatured = useToggleFeatured();
  const toggleReadStatus = useToggleReadStatus();
  const deleteQuestion = useDeleteCourseQuestion();

  const { data: answersData, isLoading: answersLoading } = useGetCourseAnswers(
    question?.id,
    answersPage,
    50
  );
  const toggleTopAnswer = useToggleTopAnswer();

  const answers = answersData?.items ?? [];

  function scrollToBottom() {
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
  }

  // Empty state
  if (!question) {
    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "background.alt" }}>
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
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          px: 3,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
              Public question in course <Box component="span" sx={{ color: "brand.main", fontWeight: 700 }}>{question.courseName}</Box>
            </Typography>
            {question.itemId && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", mt: 0.3 }}>
                Lecture{" "}
                <Typography
                  component="span"
                  variant="inherit"
                  noWrap
                  title={question.lectureName || question.itemId}
                  sx={{ color: "brand.main", fontWeight: 700, maxWidth: 260, display: "inline-block", verticalAlign: "bottom" }}
                >
                  {question.lectureName ?? question.itemId}
                </Typography>
              </Typography>
            )}

          </Box>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {/* key=question.id forces re-mount → state resets correctly on question switch */}
            <QuestionUpvoteButton key={question.id} question={question} />
            <IconButton
              size="small"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{ color: "grey.500", "&:hover": { color: "grey.800", bgcolor: "grey.100" } }}
            >
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* ── Scrollable area: question + answers ── */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3 }}>

        {/* Question block (scrolls with content) */}
        <Box sx={{ py: 2.5, borderBottom: "1px solid", borderColor: "divider", mb: 1 }}>
          {question.isFeatured && (
            <Chip
              label="Featured"
              size="small"
              sx={{ height: 16, fontSize: "0.62rem", fontWeight: 600, bgcolor: "warning.lighter", color: "warning.dark", mb: 1, "& .MuiChip-icon": { ml: 0.3 } }}
            />
          )}
          <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.4, mb: 0.5 }}>
            {question.title}
          </Typography>
          {question.detail && (
            <Box
              sx={{ mt: 1, fontSize: "0.875rem", color: "text.secondary", lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: question.detail }}
            />
          )}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
            <Avatar src={question.authorAvatar} sx={{ width: 22, height: 22 }} />
            <Typography variant="caption" color="text.disabled">
              {question.authorName} · {formatTimeAgo(question.created)}
            </Typography>
          </Stack>
        </Box>

        {/* Answers */}
        {answersLoading ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <CircularProgress size={24} sx={{ color: "brand.main" }} />
          </Box>
        ) : (
          <>
            {answers.length > 0 && (
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
                {answers.map((a) => (
                  <Box key={a.id}>
                    <AnswerCard answer={a} onToggleTop={(id) => toggleTopAnswer.mutate(id)} currentUserId={currentUserId} />
                    <Divider />
                  </Box>
                ))}
              </>
            )}

            {answers.length === 0 && (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 36, color: "grey.300", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No answers yet. Be the first to reply!</Typography>
              </Box>
            )}
          </>
        )}
        {/* Scroll anchor inside scrollable box */}
        <div ref={scrollRef} />
      </Box>

      {/* ── Sticky reply box (collapsed → expanded) ── */}
      <ReplyBox questionId={question.id} onPosted={scrollToBottom} />

      {/* 3-dot menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 210, borderRadius: 2, boxShadow: 3 } }}
      >
        <MenuItem onClick={() => { toggleFeatured.mutate(question.id); setMenuAnchor(null); }} sx={{ fontSize: "0.875rem", py: 1 }}>
          {question.isFeatured ? "Remove from featured questions" : "Add to featured questions"}
        </MenuItem>
        <MenuItem onClick={() => { toggleReadStatus.mutate(question.id); setMenuAnchor(null); }} sx={{ fontSize: "0.875rem", py: 1 }}>
          {question.isRead ? "Mark as Unread" : "Mark as Read"}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          deleteQuestion.mutate(question.id, {
            onSuccess: () => {
              if (onQuestionDeleted) onQuestionDeleted();
            }
          });
          setMenuAnchor(null);
        }} sx={{ fontSize: "0.875rem", py: 1, color: "error.main" }}>Delete</MenuItem>
      </Menu>
    </Box>
  );
}
