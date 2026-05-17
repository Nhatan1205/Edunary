import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box, IconButton, Typography, Paper, Collapse, Chip, Divider,
} from "@mui/material";
import {
  DragIndicator as DragIndicatorIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  WarningAmber as WarningAmberIcon,
} from "@mui/icons-material";
import TitleInputForm from "../TitleInputForm";
import AssignmentEditor from "./AssignmentEditor";
import AssignmentSetupStep from "./AssignmentSetupStep";
import useGetAssignmentByItemId from "../../../../../../hooks/assignment-hooks/useGetAssignmentByItemId";

function AssignmentItem({
  item,
  globalIndex,
  onDelete,
  onUpdate,
  dndRef,
  dndStyle,
  dndAttributes,
  dndListeners,
  isDragging,
  sections = [],
}) {
  const { courseId } = useParams();
  const [expanded, setExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [setupMode, setSetupMode] = useState(null);

  // hasSavedAssignment from JSON (fast, no fetch needed)
  const hasSavedAssignment = item.assignmentId > 0;

  // isPublished from API — source of truth, not from JSON blob
  const { data: assignmentData } = useGetAssignmentByItemId(
    parseInt(courseId),
    item.itemId,
    { enabled: hasSavedAssignment }
  );
  const isPublished = assignmentData?.isPublished === true;

  const handleSaveTitle = (data) => {
    onUpdate(item.itemId, { title: data.title });
    setIsEditingTitle(false);
  };

  // Delegate to CourseCurriculum — it owns confirm dialog + API call
  const handleDelete = () => onDelete(item.itemId);

  const renderEditorPanel = () => {
    if (hasSavedAssignment) {
      return (
        <AssignmentEditor
          item={item}
          onUpdate={onUpdate}
          courseId={parseInt(courseId)}
        />
      );
    }
    if (setupMode === "create") {
      return (
        <AssignmentEditor
          item={item}
          onUpdate={onUpdate}
          courseId={parseInt(courseId)}
        />
      );
    }
    return (
      <AssignmentSetupStep
        item={item}
        courseId={parseInt(courseId)}
        onUpdate={onUpdate}
        onModeChange={(m) => setSetupMode(m)}
        sections={sections}
      />
    );
  };

  if (isEditingTitle) {
    return (
      <TitleInputForm
        label={`Assignment ${globalIndex}`}
        initialTitle={item.title}
        onSave={handleSaveTitle}
        onCancel={() => setIsEditingTitle(false)}
        saveButtonText="Save"
        dragRef={dndRef}
        dragStyle={dndStyle}
      />
    );
  }

  return (
    <Paper
      ref={dndRef}
      style={dndStyle}
      data-type="item"
      sx={{
        mb: 1.5,
        border: "1px solid",
        borderColor: !hasSavedAssignment || !isPublished ? "warning.light" : "divider",
        bgcolor: "background.surface",
        boxShadow: isDragging ? 2 : 0,
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          "&:hover": { bgcolor: "background.alt" },
        }}
      >
        <IconButton
          size="small"
          {...dndAttributes}
          {...dndListeners}
          style={{ cursor: "grab" }}
          sx={{ color: "text.secondary", "&:active": { cursor: "grabbing" } }}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
          {/* Icon: warning amber if not published, brand color if published */}
          {isPublished
            ? <AssignmentIcon sx={{ color: "brand.main", fontSize: "1.2rem", flexShrink: 0 }} />
            : <WarningAmberIcon sx={{ color: "warning.main", fontSize: "1.2rem", flexShrink: 0 }} />
          }

          <Typography
            variant="body2"
            sx={{ flex: 1, minWidth: 0, color: "text.primary", fontSize: "0.95rem", fontWeight: 500 }}
          >
            {/* Label: "Unpublished Assignment" vs "Assignment" */}
            {isPublished ? "Assignment" : "Unpublished Assignment"} {globalIndex}: {item.title}
          </Typography>

          {/* Status chip */}
          {hasSavedAssignment && isPublished && (
            <Chip
              label="Published"
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontSize: 11, flexShrink: 0 }}
            />
          )}
        </Box>

        <IconButton size="small" onClick={() => setIsEditingTitle(true)} sx={{ color: "text.secondary" }}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => setExpanded(!expanded)} sx={{ color: "text.secondary" }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Editor / Setup panel */}
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ px: 2, pb: 2, pt: 1 }}>
          {renderEditorPanel()}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default AssignmentItem;
