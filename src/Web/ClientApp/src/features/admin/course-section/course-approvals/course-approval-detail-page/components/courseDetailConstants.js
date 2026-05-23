// ── Shared constants for CourseApprovalDetailPage ─────────────────────────────

export const FEEDBACK_TYPE_OPTIONS = [
  { value: "RequiredFix", label: "Required Fix" },
  { value: "RecommendedImprovement", label: "Recommended Improvement" },
];

export const CATEGORY_OPTIONS = [
  { value: 0, label: "Course Content" },
  { value: 1, label: "Video Quality" },
  { value: 2, label: "Audio Quality" },
  { value: 3, label: "Course Landing Page" },
  { value: 4, label: "Course Image" },
  { value: 5, label: "Course Title / Subtitle" },
  { value: 6, label: "Course Description" },
  { value: 7, label: "Intended Learners" },
  { value: 8, label: "Instructor Profile" },
  { value: 9, label: "Policy" },
  { value: 10, label: "Pricing" },
  { value: 11, label: "Other" },
];

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((o) => [o.value, o.label])
);

export const LEVEL_COLORS = {
  0: { color: "success.darker", bgcolor: "success.lighter" },
  1: { color: "warning.dark", bgcolor: "warning.lighter" },
  2: { color: "error.dark", bgcolor: "error.lighter" },
};

export const LEVEL_LABELS = { 0: "Beginner", 1: "Intermediate", 2: "Advanced" };

export const STATUS_COLORS = {
  0: { label: "Pending", color: "warning" },
  1: { label: "Needs Changes", color: "error" },
  2: { label: "Approved", color: "success" },
};
