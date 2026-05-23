import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DOMPurify from "dompurify";
import AlertBox from "../../../../../../components/AlertBox";

const CATEGORY_LABELS = {
  0: "Course Content",
  1: "Video Quality",
  2: "Audio Quality",
  3: "Course Landing Page",
  4: "Course Image",
  5: "Course Title / Subtitle",
  6: "Course Description",
  7: "Intended Learners",
  8: "Instructor Profile",
  9: "Policy",
  10: "Pricing",
  11: "Other",
};

// ── FeedbackCard ─────────────────────────────────────────────────────────────

function FeedbackCard({ item, onToggleResolved }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderLeft: "4px solid #000",
        borderRadius: 0,
        mb: 1.5,
        bgcolor: "background.paper",
        transition: "all 0.2s ease",
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 2.5,
          cursor: "pointer",
          "&:hover": { bgcolor: "background.alt" },
        }}
        onClick={() => setExpanded((p) => !p)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {CATEGORY_LABELS[item.category] ?? item.category}
          </Typography>
          {item.isResolved && (
            <Chip
              label="Addressed"
              size="small"
              sx={{
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 700,
                bgcolor: "success.lighter",
                color: "success.darker",
                borderRadius: "5px",
              }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleResolved(item.id, item.isResolved);
            }}
            sx={{
              color: item.isResolved ? "success.main" : "text.secondary",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              textDecoration: "none",
              p: 0.5,
              minWidth: 0,
              "&:hover": {
                textDecoration: "underline",
                bgcolor: "transparent",
              },
            }}
          >
            {item.isResolved ? "Unmark as fixed" : "Mark as fixed"}
          </Button>
          {expanded ? (
            <ExpandLessIcon sx={{ fontSize: 18, color: "text.tertiary", ml: 0.5 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 18, color: "text.tertiary", ml: 0.5 }} />
          )}
        </Box>
      </Box>

      {/* Card body */}
      <Collapse in={expanded}>
        <Box sx={{ px: 2.5, pt: 2, pb: 3.5 }}>
          <Typography
            variant="body2"
            component="div"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }}
            sx={{ color: "text.secondary", lineHeight: 1.7 }}
          />
        </Box>
      </Collapse>
    </Box>
  );
}

// ── FeedbackSection ───────────────────────────────────────────────────────────

export default function CourseFeedbackContent({ submission, feedbacks, onToggleResolved }) {
  const required = feedbacks.filter((f) => f.feedbackType === 0);    // 0 = RequiredFix
  const recommended = feedbacks.filter((f) => f.feedbackType === 1); // 1 = RecommendedImprovement
  const allRequiredResolved = required.length > 0 && required.every((f) => f.isResolved);
  const pendingRequired = required.filter((f) => !f.isResolved).length;

  return (
    <Box>
      {/* Admin overall note */}
      {submission?.adminNote && (
        <AlertBox severity="info" sx={{ mb: 3 }}>
          {submission.adminNote}
        </AlertBox>
      )}

      {/* Required fixes */}
      <Box sx={{ mb: 3.5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: pendingRequired > 0 ? "error.main" : "success.main",
            mb: 0.75,
            fontSize: "0.9rem",
          }}
        >
          Required fixes:
        </Typography>
        {required.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No required fixes.
          </Typography>
        ) : allRequiredResolved ? (
          <>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
              You have addressed all items. You can resubmit your course for review at the
              bottom of this page.
            </Typography>
            {required.map((item) => (
              <FeedbackCard key={item.id} item={item} onToggleResolved={onToggleResolved} />
            ))}
          </>
        ) : (
          <>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
              There {pendingRequired === 1 ? "is" : "are"}{" "}
              <strong>{pendingRequired}</strong> required fix
              {pendingRequired > 1 ? "es" : ""} to address before resubmitting.
            </Typography>
            {required.map((item) => (
              <FeedbackCard key={item.id} item={item} onToggleResolved={onToggleResolved} />
            ))}
          </>
        )}
      </Box>

      <Divider sx={{ borderColor: "divider", mb: 3 }} />

      {/* Recommended improvements */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: "warning.dark",
            mb: 0.75,
            fontSize: "0.9rem",
          }}
        >
          Recommended improvements:
        </Typography>
        {recommended.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            We don't have any recommended improvements at this time. Nicely done.
          </Typography>
        ) : (
          recommended.map((item) => (
            <FeedbackCard key={item.id} item={item} onToggleResolved={onToggleResolved} />
          ))
        )}
      </Box>
    </Box>
  );
}

