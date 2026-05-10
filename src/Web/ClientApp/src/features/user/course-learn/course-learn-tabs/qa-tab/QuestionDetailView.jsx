import { useState } from "react";
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
import SendIcon from "@mui/icons-material/Send";
import { formatTimeAgo, stripHtml } from "../../../../../utils/helpers";
import TextEditor from "../../../../../components/TextEditor";
import useGetCourseAnswers from "../../../../../hooks/course-qa-hooks/useGetCourseAnswers";
import useCreateCourseAnswer from "../../../../../hooks/course-qa-hooks/useCreateCourseAnswer";
import useUpdateCourseAnswer from "../../../../../hooks/course-qa-hooks/useUpdateCourseAnswer";
import useDeleteCourseAnswer from "../../../../../hooks/course-qa-hooks/useDeleteCourseAnswer";
import useUpdateCourseQuestion from "../../../../../hooks/course-qa-hooks/useUpdateCourseQuestion";
import useDeleteCourseQuestion from "../../../../../hooks/course-qa-hooks/useDeleteCourseQuestion";
import useToggleQuestionUpvote from "../../../../../hooks/course-qa-hooks/useToggleQuestionUpvote";
import useToggleAnswerUpvote from "../../../../../hooks/course-qa-hooks/useToggleAnswerUpvote";
import useGetBasicUserInfor from "../../../../../hooks/auth-hooks/useGetBasicUserInfor";
import CustomPagination from "../../../../../components/pagination/CustomPagination";

// ── Single answer row ──────────────────────────────────────────────────────
function AnswerRow({ answer, courseInstructorId, currentUserId }) {
  const navigate = useNavigate();
  const toggleUpvote = useToggleAnswerUpvote();
  const updateAnswer = useUpdateCourseAnswer();
  const deleteAnswer = useDeleteCourseAnswer();

  const [upvoted, setUpvoted] = useState(answer.hasUpvoted ?? false);
  const [upvoteCount, setUpvoteCount] = useState(answer.upvoteCount);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(answer.body);

  const isAuthor = currentUserId && answer.createdBy === currentUserId;
  const canDelete = isAuthor || (currentUserId && courseInstructorId === currentUserId);
  const showMenu = isAuthor || canDelete;

  function handleUpvote() {
    const was = upvoted;
    setUpvoted(!was);
    setUpvoteCount((p) => was ? p - 1 : p + 1);
    toggleUpvote.mutate(answer.id, {
      onSuccess: (data) => {
        if (data?.result) {
          setUpvoteCount(data.result.upvoteCount);
          setUpvoted(data.result.hasUpvoted);
        }
      },
      onError: () => {
        setUpvoted(was);
        setUpvoteCount((p) => was ? p + 1 : p - 1);
      },
    });
  }

  function handleSaveEdit() {
    if (stripHtml(editBody).trim().length === 0) return;
    updateAnswer.mutate(
      { answerId: answer.id, body: editBody },
      { onSuccess: () => setEditing(false) }
    );
  }

  return (
    <Box sx={{ py: 3, bgcolor: answer.isTopAnswer ? "background.muted" : "transparent", borderRadius: answer.isTopAnswer ? 2 : 0, mb: answer.isTopAnswer ? 2 : 1, px: answer.isTopAnswer ? 2 : 0 }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar src={answer.authorAvatar} sx={{ width: 36, height: 36, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={0.8} flexWrap="wrap">
              <Typography
                variant="body2" component="span"
                onClick={() => navigate(`/profile/${answer.createdBy}`)}
                sx={{ fontWeight: 700, color: answer.isInstructor ? "brand.dark" : "text.primary", cursor: "pointer", textDecoration: "underline" }}
              >
                {answer.authorName}
              </Typography>
              {answer.isInstructor && <Typography variant="caption" color="text.secondary" component="span">— Instructor</Typography>}
              {answer.isTopAnswer && (
                <Chip label="Answer" size="small"
                  icon={<StarIcon sx={{ fontSize: "11px !important", color: "warning.dark !important" }} />}
                  sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, bgcolor: "warning.lighter", color: "warning.darker", border: "none", "& .MuiChip-icon": { ml: 0.5 } }}
                />
              )}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{upvoteCount}</Typography>
              <IconButton size="small" onClick={handleUpvote} sx={{ p: 0.5, color: "grey.500" }}>
                {upvoted ? <ArrowCircleUpTwoToneIcon sx={{ fontSize: 20 }} /> : <ArrowCircleUpIcon sx={{ fontSize: 20 }} />}
              </IconButton>
              {showMenu && (
                <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ p: 0.5, color: "grey.500", "&:hover": { color: "grey.800" } }}>
                  <MoreVertIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
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
                <Button variant="contained" size="small" onClick={handleSaveEdit}
                  disabled={updateAnswer.isPending || stripHtml(editBody).trim().length === 0}
                  endIcon={<SendIcon sx={{ fontSize: 14 }} />}
                  sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" }, textTransform: "none", fontWeight: 700, borderRadius: 1 }}>
                  {updateAnswer.isPending ? "Saving..." : "Save"}
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box
              sx={{ fontSize: "0.875rem", color: "text.primary", lineHeight: 1.75, "& img": { maxWidth: "100%", borderRadius: 1, mt: 1 }, "& pre": { bgcolor: "grey.100", p: 1.5, borderRadius: 1, fontSize: "0.8rem", overflowX: "auto" }, "& code": { bgcolor: "grey.100", px: 0.5, borderRadius: 0.5, fontSize: "0.82rem" } }}
              dangerouslySetInnerHTML={{ __html: answer.body }}
            />
          )}
        </Box>
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 160, borderRadius: 2, boxShadow: 3 } }}>
        {isAuthor && <MenuItem onClick={() => { setEditing(true); setMenuAnchor(null); }} sx={{ fontSize: "0.875rem" }}>Edit</MenuItem>}
        {isAuthor && canDelete && <Divider />}
        {canDelete && (
          <MenuItem onClick={() => { deleteAnswer.mutate(answer.id); setMenuAnchor(null); }} sx={{ fontSize: "0.875rem", color: "error.main" }}>Delete</MenuItem>
        )}
      </Menu>
    </Box>
  );
}

export function QuestionDetailView({ question, lectureName, onBack, courseInstructorId }) {
  const navigate = useNavigate();
  const toggleQuestionUpvote = useToggleQuestionUpvote();
  const updateQuestion = useUpdateCourseQuestion();
  const deleteQuestion = useDeleteCourseQuestion();
  const { data: currentUser } = useGetBasicUserInfor();
  const currentUserId = currentUser?.userId;

  const [qUpvoted, setQUpvoted] = useState(question.hasUpvoted ?? false);
  const [qUpvoteCount, setQUpvoteCount] = useState(question.upvoteCount);
  const [qMenuAnchor, setQMenuAnchor] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editTitle, setEditTitle] = useState(question.title);
  const [editDetail, setEditDetail] = useState(question.detail ?? "");

  const [answersPage, setAnswersPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: answersData, isLoading: answersLoading } = useGetCourseAnswers(question?.id, answersPage, PAGE_SIZE);
  const answers = answersData?.items ?? [];
  const totalPages = answersData?.totalPages ?? 1;
  const totalCount = answersData?.totalCount ?? 0;
  const topAnswers = answers.filter((a) => a.isTopAnswer);
  const otherAnswers = answers.filter((a) => !a.isTopAnswer);

  const isQuestionAuthor = currentUserId && question.createdBy === currentUserId;
  const canDeleteQuestion = isQuestionAuthor || (currentUserId && courseInstructorId === currentUserId);
  const showQMenu = isQuestionAuthor || canDeleteQuestion;

  function handleSaveQuestionEdit() {
    if (!editTitle.trim()) return;
    updateQuestion.mutate(
      { questionId: question.id, title: editTitle, detail: editDetail },
      { onSuccess: () => setEditingQuestion(false) }
    );
  }

  return (
    <Box>
      {/* Back button */}
      <Box sx={{ mb: 2.5 }}>
        <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={onBack}
          sx={{ textTransform: "none", borderColor: "brand.main", color: "brand.main", fontWeight: 600, borderRadius: 2, fontSize: "0.8rem", py: 1, px: 2, "&:hover": { bgcolor: "background.muted", borderColor: "brand.dark" } }}>
          Back to All Questions
        </Button>
      </Box>

      {/* Question header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5, pb: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
          <Avatar src={question.authorAvatar} sx={{ width: 44, height: 44, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {editingQuestion ? (
              <>
                <Box component="input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Question title"
                  sx={{ width: "100%", fontSize: "1rem", fontWeight: 700, border: "1px solid", borderColor: "brand.main", borderRadius: 1, px: 1.5, py: 0.8, mb: 1.5, outline: "none", color: "text.primary", bgcolor: "background.paper" }}
                />
                <Box sx={{ border: "2px solid", borderColor: "brand.main", borderRadius: 1.5, overflow: "hidden", mb: 1.5 }}>
                  <TextEditor value={editDetail} onChange={setEditDetail} buttons={["bold", "italic", "|", "link", "image", "|", "source"]} />
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" onClick={() => { setEditingQuestion(false); setEditTitle(question.title); setEditDetail(question.detail ?? ""); }}
                    sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary", borderRadius: 1 }}>Cancel</Button>
                  <Button variant="contained" size="small" onClick={handleSaveQuestionEdit}
                    disabled={updateQuestion.isPending || !editTitle.trim()}
                    sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" }, textTransform: "none", fontWeight: 700, borderRadius: 1 }}>
                    {updateQuestion.isPending ? "Saving..." : "Save"}
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, color: "text.primary", mb: 0.8 }}>{question.title}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.6} flexWrap="wrap">
                  <Typography variant="caption" onClick={() => window.open(`/profile/${question.createdBy}`, "_blank")}
                    sx={{ color: "brand.dark", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>{question.authorName}</Typography>
                  {lectureName && (<><Typography variant="caption" color="text.disabled">·</Typography><Typography variant="caption" sx={{ color: "brand.dark" }}>{lectureName}</Typography></>)}
                  <Typography variant="caption" color="text.disabled">·</Typography>
                  <Typography variant="caption" color="text.disabled">{formatTimeAgo(question.created)}</Typography>
                </Stack>
                {question.detail && (
                  <Box sx={{ mt: 1.5, fontSize: "0.9rem", color: "text.primary", lineHeight: 1.8, "& img": { maxWidth: "100%", borderRadius: 1, mt: 1 }, "& pre": { bgcolor: "grey.100", p: 1.5, borderRadius: 1, fontSize: "0.8rem", overflowX: "auto" }, "& code": { bgcolor: "grey.100", px: 0.5, borderRadius: 0.5, fontSize: "0.82rem" }, "& p": { mt: 0.5, mb: 0 } }}
                    dangerouslySetInnerHTML={{ __html: question.detail }} />
                )}
              </>
            )}
          </Box>
        </Stack>

        {/* Question upvote + 3-dot */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0, ml: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{qUpvoteCount}</Typography>
          <IconButton size="small" onClick={() => {
            const was = qUpvoted;
            setQUpvoted(!was);
            setQUpvoteCount((p) => was ? p - 1 : p + 1);
            toggleQuestionUpvote.mutate(question.id, {
              onSuccess: (data) => { if (data?.result) { setQUpvoteCount(data.result.upvoteCount); setQUpvoted(data.result.hasUpvoted); } },
              onError: () => { setQUpvoted(was); setQUpvoteCount((p) => was ? p + 1 : p - 1); },
            });
          }} sx={{ p: 0.5, color: "grey.500" }}>
            {qUpvoted ? <ArrowCircleUpTwoToneIcon sx={{ fontSize: 22 }} /> : <ArrowCircleUpIcon sx={{ fontSize: 22 }} />}
          </IconButton>
          {showQMenu && (
            <IconButton size="small" onClick={(e) => setQMenuAnchor(e.currentTarget)} sx={{ p: 0.5, color: "grey.500", "&:hover": { color: "grey.800" } }}>
              <MoreVertIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Stack>
      </Box>

      {/* Question 3-dot menu */}
      <Menu anchorEl={qMenuAnchor} open={Boolean(qMenuAnchor)} onClose={() => setQMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 160, borderRadius: 2, boxShadow: 3 } }}>
        {isQuestionAuthor && (
          <MenuItem onClick={() => { setEditingQuestion(true); setQMenuAnchor(null); }} sx={{ fontSize: "0.875rem" }}>Edit</MenuItem>
        )}
        {isQuestionAuthor && canDeleteQuestion && <Divider />}
        {canDeleteQuestion && (
          <MenuItem onClick={() => { deleteQuestion.mutate(question.id); setQMenuAnchor(null); onBack?.(); }} sx={{ fontSize: "0.875rem", color: "error.main" }}>Delete</MenuItem>
        )}
      </Menu>

      {/* Replies count */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={700} color="text.primary">
          {answersLoading ? "Loading..." : `${totalCount} ${totalCount === 1 ? "reply" : "replies"}`}
        </Typography>
      </Stack>

      {answersLoading && <Box sx={{ py: 4, textAlign: "center" }}><CircularProgress size={28} sx={{ color: "brand.main" }} /></Box>}

      {!answersLoading && topAnswers.map((a) => (
        <AnswerRow key={a.id} answer={a} currentUserId={currentUserId} courseInstructorId={courseInstructorId} />
      ))}
      {!answersLoading && topAnswers.length > 0 && otherAnswers.length > 0 && <Divider sx={{ my: 1 }} />}
      {!answersLoading && otherAnswers.map((a) => (
        <AnswerRow key={a.id} answer={a} currentUserId={currentUserId} courseInstructorId={courseInstructorId} />
      ))}

      {!answersLoading && answers.length === 0 && (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">No answers yet. Be the first to reply!</Typography>
        </Box>
      )}

      {!answersLoading && totalPages > 1 && (
        <CustomPagination count={totalPages} page={answersPage} onChange={(_, value) => setAnswersPage(value)} />
      )}

      <ReplyBox questionId={question.id} onPosted={() => setAnswersPage(1)} />
    </Box>
  );
}

// ── Collapsed → expanded reply box ────────────────────────────────────────
function ReplyBox({ questionId, onPosted }) {
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState("");
  const createAnswer = useCreateCourseAnswer();
  const canPost = stripHtml(body).trim().length > 0 && !createAnswer.isPending;

  function handlePost() {
    if (!canPost) return;
    createAnswer.mutate({ questionId, body }, {
      onSuccess: () => { setBody(""); setExpanded(false); onPosted?.(); },
    });
  }

  return (
    <Box sx={{ mt: 3, pt: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
      {!expanded && (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box onClick={() => setExpanded(true)}
            sx={{ flex: 1, px: 2, py: 1, border: "1px solid", borderColor: "divider", borderRadius: 1, cursor: "text", color: "text.disabled", fontSize: "0.875rem", bgcolor: "background.default", "&:hover": { borderColor: "brand.light" }, transition: "border-color 0.15s" }}>
            Post a public answer...
          </Box>
          <Button variant="contained" disabled sx={{ flexShrink: 0, bgcolor: "brand.light", color: "white", borderRadius: 1, textTransform: "none", fontWeight: 700, px: 2.5, py: 0.9 }}>Post</Button>
        </Stack>
      )}
      {expanded && (
        <>
          <Box sx={{ border: "2px solid", borderColor: "brand.main", borderRadius: 1.5, overflow: "hidden", mb: 1.5 }}>
            <TextEditor value={body} onChange={setBody} buttons={["bold", "italic", "|", "link", "image", "|", "source"]} />
          </Box>
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button variant="outlined" onClick={() => { setExpanded(false); setBody(""); }}
              sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary", borderRadius: 1, px: 2 }}>Cancel</Button>
            <Button variant="contained" onClick={handlePost} disabled={!canPost}
              endIcon={<SendIcon sx={{ fontSize: 16 }} />}
              sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" }, "&:disabled": { bgcolor: "brand.light", color: "white" }, textTransform: "none", fontWeight: 700, borderRadius: 1, px: 2.5 }}>
              {createAnswer.isPending ? "Posting..." : "Post"}
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}
