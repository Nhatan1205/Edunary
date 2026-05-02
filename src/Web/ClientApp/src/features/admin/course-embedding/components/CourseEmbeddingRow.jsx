import { useState } from "react";
import {
  TableCell,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ConfirmDialog from "../../../../components/ConfirmDialogPopup/ConfirmDialog";

const bCell = { py: "14px", fontSize: "0.875rem", color: "text.secondary" };

const STATUS_CHIP = {
  embedded: { label: "Embedded", color: "success.darker", bgcolor: "success.lighter" },
  missing:  { label: "Missing",  color: "warning.dark",   bgcolor: "warning.lighter" },
};

function EmbeddingStatusChip({ embedded }) {
  const style = embedded ? STATUS_CHIP.embedded : STATUS_CHIP.missing;
  return (
    <Chip
      label={style.label}
      size="small"
      sx={{
        height: 24,
        fontSize: "0.72rem",
        fontWeight: 700,
        borderRadius: "6px",
        color: style.color,
        bgcolor: style.bgcolor,
        border: "none",
      }}
    />
  );
}

function CourseEmbeddingRow({ course, index, isEmbedded, onEmbed, onDelete }) {
  const [embedConfirmOpen, setEmbedConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  return (
    <>
      <tr>
        {/* Index */}
        <TableCell sx={{ ...bCell, color: "text.disabled", width: 48, textAlign: "center" }}>
          {index}
        </TableCell>

        {/* Course ID */}
        <TableCell sx={{ ...bCell, width: 72 }}>
          <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
            #{course.courseId ?? course.id}
          </Typography>
        </TableCell>

        {/* Title */}
        <TableCell sx={{ ...bCell, py: "10px" }}>
          <Box>
            <Typography variant="body2" fontWeight={600} color="text.primary" noWrap sx={{ maxWidth: 280 }}>
              {course.title}
            </Typography>
            {course.categoryName && (
              <Typography variant="caption" color="text.secondary">
                {course.categoryName}
              </Typography>
            )}
          </Box>
        </TableCell>

        {/* Instructor */}
        <TableCell sx={bCell}>
          <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
            {course.instructorName || "—"}
          </Typography>
        </TableCell>

        {/* Embedding Status */}
        <TableCell sx={bCell}>
          <EmbeddingStatusChip embedded={isEmbedded} />
        </TableCell>

        {/* Actions */}
        <TableCell sx={{ ...bCell, textAlign: "right", pr: 1.5 }}>
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
            <Tooltip title={isEmbedded ? "Re-embed" : "Embed now"}>
              <IconButton
                size="small"
                id={`embed-course-${course.courseId ?? course.id}`}
                onClick={() => setEmbedConfirmOpen(true)}
                sx={{ color: "text.secondary", "&:hover": { color: "brand.main" } }}
              >
                <AutoFixHighOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            {isEmbedded && (
              <Tooltip title="Delete embedding">
                <IconButton
                  size="small"
                  id={`delete-embedding-${course.courseId ?? course.id}`}
                  onClick={() => setDeleteConfirmOpen(true)}
                  sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </tr>

      <ConfirmDialog
        open={embedConfirmOpen}
        title={isEmbedded ? "Re-embed Course" : "Embed Course"}
        message={`Enqueue an embedding job for "${course.title}"? This will ${isEmbedded ? "overwrite the existing vector." : "add this course to the vector store."}`}
        onConfirm={() => { onEmbed(course.courseId ?? course.id); setEmbedConfirmOpen(false); }}
        onClose={() => setEmbedConfirmOpen(false)}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Embedding"
        message={`Remove the Qdrant vector for "${course.title}"? The course will no longer appear in AI chat recommendations.`}
        onConfirm={() => { onDelete(course.courseId ?? course.id); setDeleteConfirmOpen(false); }}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}

export default CourseEmbeddingRow;
