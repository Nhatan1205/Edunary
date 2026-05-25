import { useState, useCallback, useMemo } from "react";
import {
  Box, Typography, Button, Divider, Chip,
  IconButton, Drawer, Alert, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Tooltip,
  Collapse,
} from "@mui/material";
import AddCommentOutlinedIcon from "@mui/icons-material/AddCommentOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DOMPurify from "dompurify";
import TextEditor from "../../../../../../components/TextEditor";
import {
  FEEDBACK_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  CATEGORY_LABELS,
} from "./courseDetailConstants";

const EDIT_TYPE_OPTIONS = [
  { value: 0, label: "Required Fix" },
  { value: 1, label: "Recommended Improvement" },
];

function FeedbackTypeChip({ type }) {
  const map = {
    0: { label: "Required", color: "error.dark", bg: "error.lighter" },
    1: { label: "Recommended", color: "warning.dark", bg: "warning.lighter" },
  };
  const s = map[type] ?? map[0];
  return (
    <Chip label={s.label} size="small"
      sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, borderRadius: "6px", color: s.color, bgcolor: s.bg }} />
  );
}


function AddFeedbackForm({ onAdd, isAdding, disabled }) {
  const [type, setType] = useState("RequiredFix");
  const [category, setCategory] = useState(1);
  const [content, setContent] = useState("");
  const isEmpty = !content || content.replace(/<[^>]*>/g, "").trim() === "";

  const handleAdd = () => {
    if (isEmpty || disabled) return;
    onAdd({ feedbackType: type, category, content: content.trim() });
    setContent("");
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 140, flex: 1 }} disabled={disabled}>
          <InputLabel id="fb-type-label">Type</InputLabel>
          <Select labelId="fb-type-label" value={type} label="Type" disabled={disabled}
            onChange={(e) => setType(e.target.value)} sx={{ borderRadius: "10px" }}>
            {FEEDBACK_TYPE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160, flex: 1 }} disabled={disabled}>
          <InputLabel id="fb-cat-label">Category</InputLabel>
          <Select labelId="fb-cat-label" value={category} label="Category" disabled={disabled}
            onChange={(e) => setCategory(e.target.value)} sx={{ borderRadius: "10px" }}>
            {CATEGORY_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{
        border: "2px solid", borderColor: "divider", borderRadius: 1.5, overflow: "hidden",
        "&:focus-within": { borderColor: "brand.main" }, "& .jodit-container": { border: "none !important" }, mb: 1,
      }}>
        <TextEditor value={content} onChange={setContent} buttons={["bold", "italic", "underline", "|", "link"]} readOnly={disabled} />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button id="add-feedback-confirm-btn" variant="contained" size="small" onClick={handleAdd}
          disabled={isEmpty || isAdding || disabled}
          startIcon={isAdding
            ? <CircularProgress size={14} sx={{ color: "#fff" }} />
            : <AddCommentOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: "brand.main", color: "#fff", textTransform: "none", fontWeight: 600,
            borderRadius: "8px", boxShadow: "none", "&:hover": { bgcolor: "brand.dark", boxShadow: "none" },
          }}>
          Add
        </Button>
      </Box>
    </Box>
  );
}

function FeedbackItemRow({ item, onDelete, isDeleting, updateMutation, disabled }) {
  const [isEditing, setIsEditing] = useState(false);
  const [type, setType] = useState(item.feedbackType);
  const [category, setCategory] = useState(item.category);
  const [content, setContent] = useState(item.content);

  const isEmpty = !content || content.replace(/<[^>]*>/g, "").trim() === "";

  const handleCancel = () => {
    setIsEditing(false);
    setType(item.feedbackType);
    setCategory(item.category);
    setContent(item.content);
  };

  const handleSave = () => {
    if (isEmpty || disabled) return;
    updateMutation.mutate({
      feedbackId: item.id,
      feedbackType: type,
      category,
      content: content.trim(),
    }, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  return (
    <Box sx={{
      border: "1px solid", borderColor: "divider", borderLeft: "3px solid",
      borderLeftColor: item.feedbackType === 0 ? "error.main" : "warning.main",
      borderRadius: "0 8px 8px 0", mb: 1.25, bgcolor: "background.paper",
    }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
          <FeedbackTypeChip type={item.feedbackType} />
          <Typography variant="caption" sx={{
            bgcolor: "background.muted", color: "text.secondary",
            px: 0.75, py: 0.2, borderRadius: "5px", fontWeight: 600, fontSize: "0.65rem",
          }}>
            {CATEGORY_LABELS[item.category] ?? item.category}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {!isEditing && (
            <Tooltip title="Edit">
              <span>
                <IconButton size="small" onClick={() => setIsEditing(true)} disabled={disabled}
                  sx={{ color: "grey.500", "&:hover": { color: "brand.main" } }}>
                  <EditOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
          <Tooltip title="Remove">
            <span>
              <IconButton size="small" onClick={() => onDelete(item.id)} disabled={isDeleting || disabled}
                sx={{ color: "error.light", "&:hover": { color: "error.main" } }}>
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={{ px: 2, pb: 2 }}>
        {isEditing ? (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 120, flex: 1 }} disabled={disabled}>
                <InputLabel id={`fb-edit-type-label-${item.id}`}>Type</InputLabel>
                <Select labelId={`fb-edit-type-label-${item.id}`} value={type} label="Type" disabled={disabled}
                  onChange={(e) => setType(e.target.value)} sx={{ borderRadius: "10px" }}>
                  {EDIT_TYPE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150, flex: 1 }} disabled={disabled}>
                <InputLabel id={`fb-edit-cat-label-${item.id}`}>Category</InputLabel>
                <Select labelId={`fb-edit-cat-label-${item.id}`} value={category} label="Category" disabled={disabled}
                  onChange={(e) => setCategory(e.target.value)} sx={{ borderRadius: "10px" }}>
                  {CATEGORY_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{
              border: "2px solid", borderColor: "brand.main", borderRadius: 1.5, overflow: "hidden",
              "& .jodit-container": { border: "none !important" }, mb: 1.5,
            }}>
              <TextEditor value={content} onChange={setContent} buttons={["bold", "italic", "underline", "|", "link"]} readOnly={disabled} />
            </Box>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button variant="outlined" size="small" onClick={handleCancel} disabled={disabled}
                sx={{ textTransform: "none", borderColor: "divider", color: "text.secondary", borderRadius: 1 }}>
                Cancel
              </Button>
              <Button variant="contained" size="small" onClick={handleSave}
                disabled={isEmpty || updateMutation.isPending || disabled}
                sx={{
                  bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" },
                  textTransform: "none", fontWeight: 700, borderRadius: 1, color: "#fff",
                }}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" component="div"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }}
            sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: "0.82rem" }} />
        )}
      </Box>
    </Box>
  );
}

// ── HistorySubmissionRow ──────────────────────────────────────────────────────

function HistorySubmissionRow({ item }) {
  const [expanded, setExpanded] = useState(false);
  const feedbacks = item.feedbacks ?? [];

  const map = {
    0: { label: "Pending Review", color: "warning" },
    1: { label: "Needs Changes", color: "error" },
    2: { label: "Approved", color: "success" },
  };
  const statusCfg = map[item.status] ?? map[0];

  return (
    <Box sx={{ mb: 1.5 }}>
      <Box
        onClick={() => setExpanded((p) => !p)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          bgcolor: "action.hover",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: expanded ? "6px 6px 0 0" : "6px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": { bgcolor: "action.selected" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Sub #{item.submissionNumber}
          </Typography>
          <Chip
            label={statusCfg.label}
            color={statusCfg.color}
            size="small"
            sx={{ fontWeight: 600, height: 16, fontSize: "0.65rem" }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {feedbacks.length} item{feedbacks.length === 1 ? "" : "s"}
          </Typography>
          {expanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            px: 1.5,
            py: 1.5,
            border: "1px solid",
            borderTop: 0,
            borderColor: "divider",
            borderRadius: "0 0 6px 6px",
            bgcolor: "background.paper",
            opacity: 0.85,
          }}
        >
          {item.adminNote && (
            <Box
              sx={{
                mb: 1.5,
                p: 1,
                bgcolor: "info.lighter",
                borderRadius: 1,
                borderLeft: "3px solid",
                borderColor: "info.main",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: "info.darker", display: "block" }}>
                Admin Note:
              </Typography>
              <Typography variant="caption" sx={{ color: "info.darker", fontSize: "0.75rem" }}>
                {item.adminNote}
              </Typography>
            </Box>
          )}

          {feedbacks.length === 0 ? (
            <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              No feedback items.
            </Typography>
          ) : (
            feedbacks.map((fb) => (
              <Box
                key={fb.id}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderLeft: "3px solid",
                  borderLeftColor: fb.feedbackType === 0 ? "error.main" : "warning.main",
                  borderRadius: "0 6px 6px 0",
                  mb: 1,
                  p: 1,
                  bgcolor: "background.paper",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <FeedbackTypeChip type={fb.feedbackType} />
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: "background.muted",
                      color: "text.secondary",
                      px: 0.5,
                      borderRadius: "4px",
                      fontWeight: 600,
                      fontSize: "0.6rem",
                    }}
                  >
                    {CATEGORY_LABELS[fb.category] ?? fb.category}
                  </Typography>
                  {fb.isResolved && (
                    <Chip
                      label="Resolved"
                      size="small"
                      color="success"
                      sx={{ height: 14, fontSize: "0.55rem", fontWeight: 700 }}
                    />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  component="div"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(fb.content) }}
                  sx={{ color: "text.secondary", lineHeight: 1.5, fontSize: "0.75rem" }}
                />
              </Box>
            ))
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function FeedbackDrawer({
  open, onClose, feedbacks, submissionInfo,
  submissionHistory = [],
  saveMutation, deleteMutation, updateMutation, requestChangesMutation, approveMutation, onApproveClick,
}) {
  const isNeedFixed = submissionInfo?.status === 1;
  const requiredUnresolved = feedbacks.filter((f) => f.feedbackType === 0).length;
  const canApprove = feedbacks.length === 0 || requiredUnresolved === 0;

  const sortedFeedbacks = useMemo(() => {
    const req = feedbacks.filter((f) => f.feedbackType === 0);
    const rec = feedbacks.filter((f) => f.feedbackType !== 0);
    return [...req, ...rec];
  }, [feedbacks]);

  const handleAdd = useCallback((newItem) => {
    if (!submissionInfo?.submissionId) return;
    saveMutation.mutate({
      courseReviewSubmissionId: submissionInfo.submissionId,
      feedbackType: newItem.feedbackType === "RequiredFix" ? 0 : 1,
      category: newItem.category,
      content: newItem.content,
    });
  }, [saveMutation, submissionInfo]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100vw", sm: 480 }, display: "flex", flexDirection: "column" } }}>
      {/* Header */}
      <Box sx={{
        px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper", flexShrink: 0,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <FeedbackOutlinedIcon sx={{ color: "brand.main", fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Review Feedback</Typography>
          {feedbacks.length > 0 && (
            <Chip label={feedbacks.length} size="small"
              sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, bgcolor: "brand.lighter", color: "brand.dark" }} />
          )}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>Add Feedback</Typography>
        <AddFeedbackForm onAdd={handleAdd} isAdding={saveMutation.isPending} disabled={isNeedFixed} />

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
          {feedbacks.length > 0 ? `${feedbacks.length} item${feedbacks.length > 1 ? "s" : ""}` : "No feedback yet"}
        </Typography>

        {feedbacks.length === 0 ? (
          <Alert severity="success" sx={{ borderRadius: "10px" }}>
            No feedback added. You can approve this course.
          </Alert>
        ) : (
          sortedFeedbacks.map((item) => (
            <FeedbackItemRow key={item.id} item={item}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending}
              updateMutation={updateMutation}
              disabled={isNeedFixed} />
          ))
        )}

        {submissionHistory && submissionHistory.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ my: 2.5 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}>
              Previous Submissions ({submissionHistory.length})
            </Typography>
            {submissionHistory.map((item) => (
              <HistorySubmissionRow key={item.submissionNumber} item={item} />
            ))}
          </Box>
        )}
      </Box>

      {/* Sticky bottom actions */}
      <Box sx={{ px: 3, py: 2.5, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.paper", flexShrink: 0 }}>
        {!canApprove && (
          <Alert severity="warning" sx={{ borderRadius: "10px", mb: 1.5, py: 0.5 }}>
            <strong>{requiredUnresolved}</strong> required fix(es) unresolved
          </Alert>
        )}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button fullWidth variant="outlined" color="error" id="request-changes-btn"
            startIcon={<RateReviewOutlinedIcon />}
            disabled={feedbacks.length === 0 || requestChangesMutation.isPending || isNeedFixed}
            onClick={() => requestChangesMutation.mutate(
              { submissionId: submissionInfo?.submissionId, adminNote: "" },
              { onSuccess: () => { onClose(); } }
            )}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}>
            {requestChangesMutation.isPending ? "Sending…" : "Request Changes"}
          </Button>
          <Button fullWidth variant="contained" color="success" id="approve-publish-btn"
            startIcon={<CheckCircleOutlinedIcon />}
            disabled={!canApprove || approveMutation.isPending}
            onClick={onApproveClick}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", boxShadow: "none", "&:hover": { boxShadow: "none" } }}>
            Approve &amp; Publish
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
