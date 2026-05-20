import { useState } from "react";
import {
  Box, Typography, Stack, Avatar, Button, TextField, Skeleton,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SendIcon from "@mui/icons-material/Send";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate } from "react-router";
import { formatTimeAgo } from "../../../../utils/helpers";
import { useAuth } from "../../../../context/AuthContext";
import { tokenService } from "../../../../utils/tokenService";
import ConfirmDialog from "../../../../components/ConfirmDialogPopup/ConfirmDialog";

// ─── StarRating ───────────────────────────────────────────────────────────────
function StarRating({ value, size = 20 }) {
  return (
    <Stack direction="row" spacing={0.25}>
      {[1, 2, 3, 4, 5].map((s) =>
        s <= value ? (
          <StarIcon key={s} sx={{ fontSize: size, color: "#e59819" }} />
        ) : (
          <StarBorderIcon key={s} sx={{ fontSize: size, color: "#e59819" }} />
        )
      )}
    </Stack>
  );
}

// ─── StudentAvatar ─────────────────────────────────────────────────────────────
function StudentAvatar({ name, src, size = 40 }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  const colors = ["#1976d2", "#388e3c", "#f57c00", "#7b1fa2", "#c62828", "#00796b"];
  const color = colors[name ? name.charCodeAt(0) % colors.length : 0];
  return (
    <Avatar
      src={src || undefined}
      sx={{
        width: size, height: size, bgcolor: color,
        fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
      }}
    >
      {!src && initials}
    </Avatar>
  );
}

// ─── CourseHeader ─────────────────────────────────────────────────────────────
function CourseHeader({ courseId, courseTitle, courseImageUrl, courseRating }) {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        px: 3.5, py: 2.5,
        borderBottom: "1px solid", borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Course thumbnail */}
        <Box
          sx={{
            width: 96, height: 64, borderRadius: 1, flexShrink: 0,
            bgcolor: "background.muted", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {courseImageUrl ? (
            <Box
              component="img"
              src={courseImageUrl}
              alt={courseTitle}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <StarIcon sx={{ fontSize: 28, color: "text.disabled" }} />
          )}
        </Box>

        {/* Course info */}
        <Box>
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              color: "brand.main", cursor: "pointer", lineHeight: 1.4,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {courseTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {courseRating?.toFixed(2)} Course Rating
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.25}
            sx={{
              mt: 0.5, cursor: "pointer", width: "fit-content",
              "&:hover .view-link": { textDecoration: "underline" },
            }}
            onClick={() => navigate(`/instructor/course/${courseId}/manage`)}
          >
            <Typography
              className="view-link"
              variant="body2"
              fontWeight={700}
              sx={{ color: "brand.main" }}
            >
              View Course Summary
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 16, color: "brand.main" }} />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

// ─── InstructorResponse ───────────────────────────────────────────────────────
function InstructorResponse({ response, onEdit, onDelete }) {
  const { user } = useAuth();
  const currentUserId = user?.id || user?.userId || tokenService.getUserId();
  const isOwnResponse = response.respondedBy === currentUserId;
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Box sx={{ mt: 2.5, ml: 2.25 }}>
      {/* Header row: avatar + label/name */}
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <StudentAvatar
          name={response.instructorFullName}
          src={response.instructorAvatar}
          size={40}
        />
        <Box>
          {/* "Instructor" bold label */}
          <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            Instructor
          </Typography>
          {/* Name + Posted date */}
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography variant="body2" sx={{ color: "brand.main", fontWeight: 500 }}>
              {response.instructorFullName}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Posted {formatTimeAgo(response.respondedAt)}
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <Typography
        variant="body2"
        sx={{
          mt: 1.25,
          lineHeight: 1.75,
          color: "text.primary",
          maxWidth: { xs: "100%", md: "80%" }
        }}
      >
        {response.responseText}
      </Typography>

      {/* Buttons */}
      {isOwnResponse && (
        <Stack direction="row" spacing={1} mt={1.5}>
          <Button
            variant="outlined"
            size="small"
            onClick={onEdit}
            sx={{
              textTransform: "none", borderRadius: 1,
              borderColor: "text.primary", color: "text.primary",
              fontWeight: 600, fontSize: "0.8125rem",
              "&:hover": { borderColor: "brand.main", color: "brand.main" },
            }}
          >
            Edit Response
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={() => setConfirmOpen(true)}
            sx={{ textTransform: "none", color: "error.main", fontSize: "0.8rem" }}
          >
            Delete
          </Button>
        </Stack>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Response"
        message="Are you sure you want to delete this response?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          onDelete();
          setConfirmOpen(false);
        }}
      />
    </Box>
  );
}

// ─── ResponseBox ──────────────────────────────────────────────────────────────
function ResponseBox({ review, onRespond, onEditResponse, onDeleteResponse }) {
  const [mode, setMode] = useState("idle"); // "idle" | "reply" | "edit"
  const [text, setText] = useState("");

  const hasResponse = Boolean(review.ratingResponse);

  function handleOpenEdit() {
    setText(review.ratingResponse?.responseText ?? "");
    setMode("edit");
  }

  function handleCancel() {
    setMode("idle");
    setText("");
  }

  function handleSubmit() {
    if (!text.trim()) return;
    if (mode === "reply") onRespond(review.id, text.trim());
    else onEditResponse(review.id, text.trim());
    setMode("idle");
    setText("");
  }

  // Existing response
  if (hasResponse && mode === "idle") {
    return (
      <InstructorResponse
        response={review.ratingResponse}
        onEdit={handleOpenEdit}
        onDelete={() => onDeleteResponse(review.id)}
      />
    );
  }

  // Reply / Edit text area
  if (mode === "reply" || mode === "edit") {
    return (
      <Box sx={{ mt: 2.5, maxWidth: { xs: "100%" } }}>
        <TextField
          multiline
          minRows={3}
          fullWidth
          placeholder="Write your response..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
              fontSize: "0.875rem",
              "&.Mui-focused fieldset": { borderColor: "brand.main" },
            },
          }}
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleCancel}
            sx={{
              textTransform: "none", borderColor: "divider",
              color: "text.secondary", borderRadius: 1.5,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={!text.trim()}
            onClick={handleSubmit}
            endIcon={<SendIcon sx={{ fontSize: 14 }} />}
            sx={{
              bgcolor: "brand.main", "&:hover": { bgcolor: "brand.dark" },
              "&:disabled": { bgcolor: "brand.light", color: "white" },
              textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5,
            }}
          >
            {mode === "edit" ? "Save" : "Submit"}
          </Button>
        </Stack>
      </Box>
    );
  }

  // No response yet
  return (
    <Box sx={{ mt: 2 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => { setText(""); setMode("reply"); }}
        sx={{
          textTransform: "none", borderRadius: 1,
          borderColor: "text.primary", color: "text.primary",
          fontWeight: 600, fontSize: "0.8125rem",
          "&:hover": { borderColor: "brand.main", color: "brand.main" },
        }}
      >
        Respond
      </Button>
    </Box>
  );
}

// ─── ReviewPanel ──────────────────────────────────────────────────────────────
export default function ReviewPanel({
  review,
  showCourseHeader,
  onRespond,
  onEditResponse,
  onDeleteResponse,
}) {
  const isModified = new Date(review.lastModified).getTime() - new Date(review.created).getTime() > 1000;
  const timeLabel = isModified
    ? `Updated ${formatTimeAgo(review.lastModified)}`
    : `Posted ${formatTimeAgo(review.created)}`;

  return (
    <Box
      sx={{
        borderRadius: 2, border: "1px solid", borderColor: "divider",
        bgcolor: "background.paper", overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        minHeight: 180,
      }}
    >
      {/* Course header — only in "All Courses" mode */}
      {showCourseHeader && (
        <CourseHeader
          courseId={review.courseId}
          courseTitle={review.courseTitle}
          courseImageUrl={review.courseImageUrl}
          courseRating={review.courseRating}
        />
      )}

      {/* Review body */}
      <Box sx={{ px: 3.5, py: 3 }}>
        {/* Student info row */}
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          <StudentAvatar
            name={review.studentFullName}
            src={review.studentAvatar}
            size={40}
          />
          <Box>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ color: "brand.main", lineHeight: 1.3 }}
            >
              {review.studentFullName}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {timeLabel}
            </Typography>
          </Box>
        </Stack>

        {/* Stars */}
        <Box sx={{ mt: 1.25 }}>
          <StarRating value={review.rating} />
        </Box>

        <Box
          sx={{
            mt: 1.25,
            minHeight: 48,
            maxWidth: { xs: "100%", md: "80%" }
          }}
        >
          {review.review && (
            <Typography variant="body2" sx={{ lineHeight: 1.75, color: "text.primary" }}>
              {review.review}
            </Typography>
          )}
        </Box>

        {/* Response area — no divider */}
        <ResponseBox
          review={review}
          onRespond={onRespond}
          onEditResponse={onEditResponse}
          onDeleteResponse={onDeleteResponse}
        />
      </Box>
    </Box>
  );
}

// ─── ReviewPanelSkeleton ───────────────────────────────────────────────────────
export function ReviewPanelSkeleton({ showCourseHeader = true }) {
  return (
    <Box
      sx={{
        borderRadius: 2, border: "1px solid", borderColor: "divider",
        bgcolor: "background.paper", overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        minHeight: 180,
      }}
    >
      {showCourseHeader && (
        <Box sx={{ px: 3.5, py: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="rectangular" width={96} height={64} sx={{ borderRadius: 1 }} />
            <Box sx={{ width: "40%" }}>
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="40%" height={16} />
              <Skeleton variant="text" width="50%" height={16} />
            </Box>
          </Stack>
        </Box>
      )}

      <Box sx={{ px: 3.5, py: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ width: "120px" }}>
            <Skeleton variant="text" width="100%" height={18} />
            <Skeleton variant="text" width="70%" height={14} />
          </Box>
        </Stack>

        <Box sx={{ mt: 1.25 }}>
          <Skeleton variant="rectangular" width={100} height={20} />
        </Box>

        <Box sx={{ mt: 1.25, maxWidth: { xs: "100%" } }}>
          <Skeleton variant="text" width="100%" height={18} />
          <Skeleton variant="text" width="90%" height={18} />
          <Skeleton variant="text" width="40%" height={18} />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" width={80} height={30} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
    </Box>
  );
}
