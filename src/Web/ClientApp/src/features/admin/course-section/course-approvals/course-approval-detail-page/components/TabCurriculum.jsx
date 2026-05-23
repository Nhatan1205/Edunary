import { useState } from "react";
import { Box, Typography, Chip, Divider, Alert, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";

const TYPE_COLORS = {
  video: { color: "#1d6fe8", bg: "rgba(29,111,232,0.08)" },
  quiz: { color: "#7b1fa2", bg: "rgba(123,31,162,0.08)" },
  assignment: { color: "#c84b00", bg: "rgba(200,75,0,0.08)" },
  article: { color: "#2e7d32", bg: "rgba(46,125,50,0.08)" },
};

function ItemIcon({ contentType, type }) {
  const t = contentType || type;
  if (t === "video") return <PlayCircleOutlineIcon sx={{ fontSize: 16, color: "text.secondary" }} />;
  if (t === "quiz") return <QuizOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />;
  if (t === "assignment") return <AssignmentOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />;
  return <ArticleOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />;
}

function SectionLabel({ children }) {
  return (
    <Typography variant="caption" sx={{
      fontWeight: 700, color: "text.tertiary",
      textTransform: "uppercase", letterSpacing: "0.07em",
      display: "block", mb: 0.75,
    }}>
      {children}
    </Typography>
  );
}

export default function TabCurriculum({ sections }) {
  const [expanded, setExpanded] = useState(() => {
    const init = {};
    if (sections?.[0]) init[sections[0].sectionId] = true;
    return init;
  });

  if (!sections?.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ borderRadius: "10px" }}>No curriculum sections found.</Alert>
      </Box>
    );
  }

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalItems = sections.reduce((acc, s) => acc + (s.items?.length ?? 0), 0);
  const totalVideos = sections.reduce(
    (acc, s) => acc + (s.items?.filter((i) => (i.contentType || i.type) === "video").length ?? 0), 0
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Stats row */}
      <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
        {[
          { label: "Sections", value: sections.length },
          { label: "Lectures", value: totalItems },
          { label: "Videos", value: totalVideos },
        ].map(({ label, value }) => (
          <Box key={label}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1 }}>{value}</Typography>
            <Typography variant="caption" sx={{ color: "text.tertiary" }}>{label}</Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {sections.map((section, si) => (
        <Box key={section.sectionId} sx={{ mb: 0.5 }}>
          <Box onClick={() => toggle(section.sectionId)}
            sx={{
              px: 1.5, py: 1.5, display: "flex", justifyContent: "space-between",
              alignItems: "center", cursor: "pointer", borderRadius: "8px",
              "&:hover": { bgcolor: "background.surface" }, transition: "background 0.15s",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="caption" sx={{ color: "text.tertiary", fontWeight: 700, minWidth: 20 }}>
                {si + 1}.
              </Typography>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {section.title}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                  {section.items?.length ?? 0} lectures
                </Typography>
              </Box>
            </Box>
            {expanded[section.sectionId]
              ? <ExpandLessIcon sx={{ fontSize: 16, color: "text.tertiary" }} />
              : <ExpandMoreIcon sx={{ fontSize: 16, color: "text.tertiary" }} />}
          </Box>

          <Collapse in={!!expanded[section.sectionId]}>
            <Box sx={{ pl: 4 }}>
              {(section.items ?? []).map((item, ii) => {
                const type = item.contentType || item.type || "article";
                const tc = TYPE_COLORS[type] ?? TYPE_COLORS.article;
                return (
                  <Box key={item.itemId ?? ii}
                    sx={{
                      py: 1.25, display: "flex", alignItems: "center", gap: 1.5,
                      borderBottom: "1px solid", borderColor: "divider",
                    }}>
                    <ItemIcon contentType={item.contentType} type={item.type} />
                    <Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }}>
                      {item.title}
                    </Typography>
                    {type === "video" && item.videoDuration && (
                      <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                        {item.videoDuration.replace(/"/g, "")}
                      </Typography>
                    )}
                    <Typography sx={{
                      fontSize: "0.65rem", fontWeight: 700,
                      color: tc.color, bgcolor: tc.bg, px: 0.75, py: 0.25,
                      borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      {type}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Collapse>
        </Box>
      ))}
    </Box>
  );
}
