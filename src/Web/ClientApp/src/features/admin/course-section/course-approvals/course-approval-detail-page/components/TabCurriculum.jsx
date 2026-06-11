import { Box, Typography } from "@mui/material";
import AdminCurriculumSection from "./AdminCurriculumSection";

export default function TabCurriculum({ sections, courseId }) {
  if (!sections?.length) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
          No curriculum sections found.
        </Typography>
      </Box>
    );
  }

  const totalItems = sections.reduce((acc, s) => acc + (s.items?.length ?? 0), 0);
  const totalVideos = sections.reduce(
    (acc, s) => acc + (s.items?.filter((i) => (i.contentType || i.type) === "video").length ?? 0), 0
  );

  // Calculate global index offsets for each section
  const globalIndexOffsets = [];
  let offset = 1;
  for (const section of sections) {
    globalIndexOffsets.push(offset);
    offset += section.items?.length ?? 0;
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Stats row - simplified, no fancy icons, just plain layout */}
      <Box sx={{ display: "flex", gap: 3, mb: 3, pb: 1.5, borderBottom: "1px solid #E5E7EB" }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          <strong>Sections:</strong> {sections.length}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          <strong>Total Lectures:</strong> {totalItems}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          <strong>Videos:</strong> {totalVideos}
        </Typography>
      </Box>

      {/* Sections */}
      {sections.map((section, si) => (
        <AdminCurriculumSection
          key={section.sectionId}
          section={section}
          sectionIndex={si}
          courseId={courseId}
          globalIndexStart={globalIndexOffsets[si]}
        />
      ))}
    </Box>
  );
}

