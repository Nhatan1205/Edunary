import { useState, useMemo } from "react";
import {
  Box, Typography, Stack, MenuItem,
  Avatar, IconButton, Tooltip, Button, Checkbox, Divider,
  FormControlLabel, CircularProgress, Collapse, Menu,
} from "@mui/material";
import AssignmentSharpIcon from "@mui/icons-material/AssignmentSharp";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CircleIcon from "@mui/icons-material/Circle";
import SendIcon from "@mui/icons-material/Send";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MainCard from "../../../../components/instructor-layout/MainCard";
import PageTitle from "../../../../components/PageTitle";
import NoData from "../../../../components/NoData";
import emptySubmissionImg from "../../../../assets/images/empty-mailbox.png";
import TextEditor from "../../../../components/TextEditor";
import useGetCoursesAuthor from "../../../../hooks/course-hooks/useGetCoursesAuthor";
import useGetInstructorSubmissions from "../../../../hooks/assignment-submission-hooks/useGetInstructorSubmissions";
import useGetStudentSubmission from "../../../../hooks/assignment-submission-hooks/useGetStudentSubmission";
import useToggleSubmissionRead from "../../../../hooks/assignment-submission-hooks/useToggleSubmissionRead";
import useCreateAssignmentFeedback from "../../../../hooks/assignment-submission-hooks/useCreateAssignmentFeedback";
import useUpdateAssignmentFeedback from "../../../../hooks/assignment-submission-hooks/useUpdateAssignmentFeedback";
import useDeleteAssignmentFeedback from "../../../../hooks/assignment-submission-hooks/useDeleteAssignmentFeedback";
import DefaultSelect from "../../../../components/drop-down/DefaultSelect";
import { formatTimeAgo, stripHtml } from "../../../../utils/helpers";

// ─── ReadToggleButton ──────────────────────────────────────────────────────────
function ReadToggleButton({ isRead, submissionId, onToggle }) {
  const toggleRead = useToggleSubmissionRead();

  function handleClick(e) {
    e.stopPropagation();
    const newState = !isRead;
    onToggle(newState);
    toggleRead.mutate({ submissionId, isRead: newState });
  }

  return (
    <Tooltip title={isRead ? "Mark as unread" : "Mark as read"}>
      <IconButton onClick={handleClick} size="small" sx={{ p: 0.5 }}>
        {isRead
          ? <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: "grey.400" }} />
          : <CircleIcon sx={{ fontSize: 20, color: "brand.main" }} />
        }
      </IconButton>
    </Tooltip>
  );
}

// ─── FeedbackReplyBox ──────────────────────────────────────────────────────────
function FeedbackReplyBox({ submissionId, feedbacks }) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const createFeedback = useCreateAssignmentFeedback();

  const canPost = stripHtml(content).trim().length > 0 && !createFeedback.isPending;

  function handlePost() {
    if (!canPost) return;
    createFeedback.mutate(
      { submissionId, content },
      { onSuccess: () => { setContent(""); setExpanded(false); } }
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      {/* Divider with "YOUR FEEDBACK" text riding on the line */}
      <Divider sx={{ mb: 2 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: 1, px: 1.5 }}
        >
          Your feedback
        </Typography>
      </Divider>

      {/* Existing feedbacks sit BELOW the divider */}
      {feedbacks?.length > 0 && (
        <Box sx={{ mb: 2.5 }}>
          {feedbacks.map((fb) => (
            <FeedbackCard key={fb.feedbackId} fb={fb} submissionId={submissionId} />
          ))}
        </Box>
      )}

      {/* Reply input */}
      {!expanded ? (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            onClick={() => setExpanded(true)}
            sx={{
              flex: 1, px: 2, py: 1,
              border: "1px solid", borderColor: "divider",
              borderRadius: 1.5, cursor: "text", color: "text.disabled",
              fontSize: "0.875rem", bgcolor: "background.default",
              "&:hover": { borderColor: "brand.light" },
              transition: "border-color 0.15s",
            }}
          >
            Write feedback for this student...
          </Box>
          <Button variant="contained" disabled
            sx={{
              flexShrink: 0, bgcolor: "brand.light", color: "white",
              borderRadius: 1.5, textTransform: "none", fontWeight: 700, px: 2.5, py: 0.9,
            }}
          >
            Send
          </Button>
        </Stack>
      ) : (
        <>
          <Box sx={{ border: "2px solid", borderColor: "brand.main", borderRadius: 1.5, overflow: "hidden", mb: 1.5 }}>
            <TextEditor
              value={content}
              onChange={setContent}
              buttons={["bold", "italic", "|", "link", "|", "source"]}
            />
          </Box>
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button variant="outlined" size="small"
              onClick={() => { setExpanded(false); setContent(""); }}
              sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary", borderRadius: 1.5 }}
            >
              Cancel
            </Button>
            <Button variant="contained" size="small"
              onClick={handlePost} disabled={!canPost}
              endIcon={<SendIcon sx={{ fontSize: 14 }} />}
              sx={{
                bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" },
                "&:disabled": { bgcolor: "brand.light", color: "white" },
                textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5,
              }}
            >
              {createFeedback.isPending ? "Sending..." : "Send Feedback"}
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}

// ─── FeedbackCard ──────────────────────────────────────────────────────────
function FeedbackCard({ fb, submissionId }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(fb.content);
  const updateFeedback = useUpdateAssignmentFeedback();
  const deleteFeedback = useDeleteAssignmentFeedback();

  function handleSaveEdit() {
    updateFeedback.mutate(
      { feedbackId: fb.feedbackId, submissionId, content: editContent },
      { onSuccess: () => setEditing(false) }
    );
  }

  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
      <Avatar src={fb.instructorAvatar} sx={{ width: 32, height: 32, flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" fontWeight={600}>{fb.instructorName}</Typography>
            <Typography variant="caption" color="text.disabled">{formatTimeAgo(fb.createdAt)}</Typography>
          </Stack>
          {/* ... menu */}
          <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ p: 0.4, color: "grey.400", "&:hover": { color: "grey.700" } }}
          >
            <MoreVertIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        {editing ? (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ border: "2px solid", borderColor: "brand.main", borderRadius: 1.5, overflow: "hidden", mb: 1.5 }}>
              <TextEditor value={editContent} onChange={setEditContent}
                buttons={["bold", "italic", "|", "link", "|", "source"]} />
            </Box>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" size="small"
                onClick={() => { setEditing(false); setEditContent(fb.content); }}
                sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary", borderRadius: 1.5 }}
              >Cancel</Button>
              <Button variant="contained" size="small"
                onClick={handleSaveEdit}
                disabled={updateFeedback.isPending || stripHtml(editContent).trim().length === 0}
                endIcon={<SendIcon sx={{ fontSize: 14 }} />}
                sx={{ bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" }, textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
              >
                {updateFeedback.isPending ? "Saving..." : "Save"}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box dangerouslySetInnerHTML={{ __html: fb.content }}
            sx={{ fontSize: "0.875rem", lineHeight: 1.7, mt: 0.5, "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }} />
        )}
      </Box>

      {/* Dropdown menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 180, borderRadius: 2, boxShadow: 3 } }}
      >
        <MenuItem onClick={() => { setEditing(true); setMenuAnchor(null); }}
          sx={{ fontSize: "0.875rem", py: 1 }}
        >
          Edit response
        </MenuItem>
        <MenuItem
          onClick={() => { deleteFeedback.mutate({ feedbackId: fb.feedbackId, submissionId }); setMenuAnchor(null); }}
          sx={{ fontSize: "0.875rem", py: 1 }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Stack>
  );
}

function SubmissionDetail({ submissionId, submission }) {
  const { data, isLoading } = useGetStudentSubmission(submissionId);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={24} sx={{ color: "brand.main" }} />
      </Box>
    );
  }

  if (!data) return null;

  return (
    <Box>
      {/* Student identity */}
      <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
        <Avatar src={submission.studentAvatar} sx={{ width: 38, height: 38, flexShrink: 0 }} />
        <Box>
          <Typography variant="body2" fontWeight={700}>{submission.studentName}</Typography>
          <Typography variant="caption" color="text.disabled">
            Submitted {formatTimeAgo(submission.submittedAt)}
          </Typography>
        </Box>
      </Stack>

      {/* Student answers */}
      {data.answers?.map((a, i) => (
        <Box key={a.questionId} sx={{ mb: i < data.answers.length - 1 ? 3 : 0 }}>
          <Stack direction="row" gap={1} alignItems="flex-start" mb={0.75}>
            <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24, flexShrink: 0, pt: "1px" }}>
              {i + 1}.
            </Typography>
            <Box dangerouslySetInnerHTML={{ __html: a.questionText }}
              sx={{ lineHeight: 1.7, fontWeight: 500, fontSize: "0.9rem", "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }} />
          </Stack>
          {a.studentAnswer ? (
            <Box sx={{ ml: 3.5 }}>
              <Box dangerouslySetInnerHTML={{ __html: a.studentAnswer }}
                sx={{ lineHeight: 1.7, fontSize: "0.875rem", "& p:first-of-type": { mt: 0 }, "& p:last-of-type": { mb: 0 } }} />
            </Box>
          ) : (
            <Typography variant="body2" color="text.disabled" fontStyle="italic" sx={{ ml: 3.5 }}>
              No answer provided.
            </Typography>
          )}
        </Box>
      ))}

      {/* "Your feedback" divider — feedbacks + reply box sit below it */}
      <FeedbackReplyBox submissionId={submissionId} feedbacks={data.feedbacks} />
    </Box>
  );
}

// ─── SubmissionPanel ───────────────────────────────────────────────────────────
function SubmissionPanel({ submission }) {
  const [localIsRead, setLocalIsRead] = useState(submission.isRead);
  const [expanded, setExpanded] = useState(false);
  const toggleRead = useToggleSubmissionRead();

  function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && !localIsRead) {
      setLocalIsRead(true);
      toggleRead.mutate({ submissionId: submission.submissionId, isRead: true });
    }
  }

  return (
    // Outer row: read-toggle button floats LEFT — aligned with the panel header
    <Stack direction="row" alignItems="flex-start" spacing={1}>
      {/* Read toggle — pinned to top, aligned with the panel header row (~py:1.75 = 14px + 4px border) */}
      <Box sx={{ pt: "18px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        <ReadToggleButton
          isRead={localIsRead}
          submissionId={submission.submissionId}
          onToggle={setLocalIsRead}
        />
      </Box>

      {/* Panel itself */}
      <Box
        onClick={handleExpand}
        sx={{
          flex: 1, minWidth: 0,
          borderRadius: 2.5, border: "1px solid", borderColor: "divider",
          bgcolor: "background.paper", cursor: "pointer",
          boxShadow: expanded ? "0 4px 20px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.2s",
          overflow: "hidden",
        }}
      >
        {/* Header row */}
        <Stack
          direction="row" alignItems="center" spacing={1.5}
          sx={{ px: 2, py: 1.75, bgcolor: expanded ? "background.alt" : "transparent" }}
        >
          {/* Unread dot is OUTSIDE, so no dot inside header */}

          {/* Assignment icon — dark */}
          <AssignmentSharpIcon sx={{ fontSize: 24, color: "text.primary", flexShrink: 0 }} />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} color="grey.600" noWrap>
              {submission.courseTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Assignment:{" "}
              <Box component="span" sx={{ color: "brand.main", fontWeight: 600 }}>
                {submission.assignmentTitle}
              </Box>
            </Typography>
          </Box>

          {/* Expand chevron only */}
          <IconButton size="small" sx={{ color: "text.secondary", p: 0.5, flexShrink: 0 }}
            onClick={(e) => { e.stopPropagation(); handleExpand(); }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>

        {/* Expandable content */}
        <Collapse in={expanded} onClick={(e) => e.stopPropagation()}>
          <Box sx={{ px: 3, pb: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <SubmissionDetail submissionId={submission.submissionId} submission={submission} />
          </Box>
        </Collapse>
      </Box>
    </Stack>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "newestFirst", label: "Newest First" },
  { value: "oldestFirst", label: "Oldest First" },
];

const FEEDBACK_FILTER_OPTIONS = [
  { value: "all", label: "All Submissions" },
  { value: "none", label: "No Feedback" },
  { value: "has_feedback", label: "Has Feedback" },
];

export default function AssignmentDashboardPage() {
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [sortBy, setSortBy] = useState("newestFirst");
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data: coursesData } = useGetCoursesAuthor("", 0, 1, 100, 16); // 16
  const courseOptions = useMemo(() => {
    const items = coursesData?.items ?? [];
    return [
      { value: "all", label: "All Courses" },
      ...items.map((c) => ({ value: c.id, label: c.title, isOwner: c.isOwner, isCollaborator: c.isCollaborator, })),
    ];
  }, [coursesData]);

  const { data, isLoading } = useGetInstructorSubmissions({
    courseId: selectedCourseId ?? undefined,
    readFilter: showUnreadOnly ? "unread" : "all",
    feedbackFilter,
    sortBy,
    pageNumber: page,
    pageSize: 20,
  });

  const submissions = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const unreadCount = submissions.filter((s) => !s.isRead).length;

  const selectedCourseOption = courseOptions.find((o) => o.value === (selectedCourseId ?? "all")) ?? courseOptions[0];
  const selectedFeedbackOption = FEEDBACK_FILTER_OPTIONS.find((o) => o.value === feedbackFilter) ?? FEEDBACK_FILTER_OPTIONS[0];
  const selectedSortOption = SORT_OPTIONS.find((o) => o.value === sortBy) ?? SORT_OPTIONS[0];

  return (
    <MainCard>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <PageTitle title="Assignment Submissions" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Review and give feedback on student submissions across your courses
        </Typography>
      </Box>

      {/* Toolbar */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }} flexWrap="wrap" gap={1}>
        <DefaultSelect
          data={courseOptions}
          value={[selectedCourseOption]}
          onChange={([item]) => {
            const val = item?.value ?? "all";
            setSelectedCourseId(val === "all" ? null : val);
            setPage(1);
          }}
          defaultLabel="All Courses"
        />
        <DefaultSelect
          data={FEEDBACK_FILTER_OPTIONS}
          value={[selectedFeedbackOption]}
          onChange={([item]) => { setFeedbackFilter(item?.value ?? "all"); setPage(1); }}
          defaultLabel="All Submissions"
        />
        <DefaultSelect
          data={SORT_OPTIONS}
          value={[selectedSortOption]}
          onChange={([item]) => { setSortBy(item?.value ?? "newestFirst"); setPage(1); }}
          defaultLabel="Newest first"
        />
        {/* Unread checkbox — right side */}
        <FormControlLabel
          control={
            <Checkbox
              checked={showUnreadOnly}
              onChange={(e) => { setShowUnreadOnly(e.target.checked); setPage(1); }}
              size="small"
              sx={{ color: "brand.main", "&.Mui-checked": { color: "brand.main" } }}
            />
          }
          label={
            <Typography variant="body2" fontWeight={500}>
              Unread only{unreadCount > 0 && (
                <Box component="span" sx={{ ml: 0.5 }}>({unreadCount})</Box>
              )}
            </Typography>
          }
          sx={{ ml: 0 }}
        />
      </Stack>

      {/* List */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: "brand.main" }} />
        </Box>
      ) : submissions.length === 0 ? (
        <NoData
          image={emptySubmissionImg}
          title="No submissions found"
          description="Try adjusting your filters, or wait for students to submit their assignments."
          minHeight="320px"
        />
      ) : (
        <Stack spacing={1.5}>
          {submissions.map((s) => (
            <SubmissionPanel key={s.submissionId} submission={s} />
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {totalCount > 20 && (
        <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 4 }}>
          <Button variant="outlined" size="small" disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            sx={{ borderColor: "divider", color: "text.secondary", borderRadius: 2, textTransform: "none" }}
          >
            Previous
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center", px: 1 }}>
            Page {page} of {Math.ceil(totalCount / 20)}
          </Typography>
          <Button variant="outlined" size="small" disabled={page >= Math.ceil(totalCount / 20)}
            onClick={() => setPage((p) => p + 1)}
            sx={{ borderColor: "divider", color: "text.secondary", borderRadius: 2, textTransform: "none" }}
          >
            Next
          </Button>
        </Stack>
      )}
    </MainCard>
  );
}
