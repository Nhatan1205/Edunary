import { Box, Typography, Avatar, Chip, Divider, Card, Button } from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { LEVEL_COLORS, LEVEL_LABELS } from "./courseDetailConstants";
import { formatShortDate } from "../../../../../../utils/helpers";

export default function CourseInfoCard({ course, submissionInfo, submissionId, courseId }) {
  const handlePreview = () => {
    window.open(
      `/admin/course/approvals/${submissionId}/preview/${courseId}`,
      `admin_preview_${courseId}`,
    );
  };

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: "14px", overflow: "hidden" }}>
      {/* Thumbnail */}
      <Box sx={{ position: "relative" }}>
        <Avatar src={course.imageUrl} variant="square"
          sx={{ width: "100%", height: 175, borderRadius: 0, bgcolor: "background.muted", fontSize: "3rem" }}>
          📚
        </Avatar>
      </Box>

      <Box sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.4, mb: 0.5 }}>
          {course.title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, fontSize: "0.82rem" }}>
          {course.subtitle}
        </Typography>

        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2 }}>
          <Chip label={LEVEL_LABELS[course.level] ?? course.level} size="small"
            sx={{
              height: 20, fontSize: "0.65rem", fontWeight: 700, borderRadius: "6px",
              color: LEVEL_COLORS[course.level]?.color ?? "text.secondary",
              bgcolor: LEVEL_COLORS[course.level]?.bgcolor ?? "grey.200",
            }} />
          <Chip label={course.categoryTitle} size="small"
            sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600, borderRadius: "6px", bgcolor: "brand.lighter", color: "brand.dark" }} />
          <Chip label={`$${course.price?.toFixed(2)}`} size="small"
            sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, borderRadius: "6px" }} />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Instructor */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2 }}>
          <Avatar src={course.instructorAvatar} sx={{ width: 34, height: 34 }}>
            {course.instructorName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.82rem" }}>
              {course.instructorName}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.tertiary" }}>Instructor</Typography>
          </Box>
        </Box>

        {/* Stats grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, mb: 2 }}>
          {[
            { label: "Submission", value: `#${submissionInfo?.submissionNumber ?? "—"}` },
            { label: "Students", value: course.totalStudents ?? 0 },
            { label: "Rating", value: course.ratings ? `★ ${course.ratings.toFixed(1)}` : "—" },
            { label: "Submitted", value: formatShortDate(submissionInfo?.submittedAt) },
          ].map(({ label, value }) => (
            <Box key={label} sx={{ bgcolor: "background.surface", borderRadius: "8px", px: 1.5, py: 1 }}>
              <Typography variant="caption" sx={{ color: "text.tertiary", display: "block" }}>{label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.82rem" }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Button fullWidth variant="outlined" id="preview-course-btn"
          startIcon={<VisibilityOutlinedIcon />}
          onClick={handlePreview}
          sx={{
            borderRadius: "10px", textTransform: "none", fontWeight: 700, borderColor: "divider",
            color: "text.primary", py: 1, "&:hover": { borderColor: "brand.main", color: "brand.main", bgcolor: "brand.lighter" },
          }}>
          Preview Content
        </Button>
      </Box>
    </Card>
  );
}
