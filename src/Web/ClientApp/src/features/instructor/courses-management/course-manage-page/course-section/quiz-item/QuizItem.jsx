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
  Quiz as QuizIcon,
} from "@mui/icons-material";
import TitleInputForm from "../TitleInputForm";
import QuizEditor from "./QuizEditor";
import QuizSetupStep from "./QuizSetupStep";


// ─── Main QuizItem ─────────────────────────────────────────────────────────────
function QuizItem({ item, globalIndex, onDelete, onUpdate, dndRef, dndStyle, dndAttributes, dndListeners, isDragging, sections = [] }) {
  const { courseId } = useParams();
  const [expanded, setExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [setupMode, setSetupMode] = useState(null);
  const handleSaveTitle = (data) => {
    onUpdate(item.itemId, { title: data.title });
    setIsEditingTitle(false);
  };

  // Decide what to show in the expanded panel
  const renderEditorPanel = () => {
    // Already linked to a quiz → show editor directly
    if (item.quizId > 0) {
      return (
        <QuizEditor item={item} onUpdate={onUpdate} courseId={parseInt(courseId)} sections={sections} />
      );
    }
    // No quiz yet: user picked "Create New"
    if (setupMode === "create") {
      return (
        <QuizEditor item={item} onUpdate={onUpdate} courseId={parseInt(courseId)} sections={sections} />
      );
    }
    // No quiz yet: show setup step (pick create or choose existing)
    return (
      <QuizSetupStep
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
        label={`Quiz ${globalIndex}`}
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
        borderColor: "divider",
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
          <QuizIcon sx={{ color: "brand.main", fontSize: "1.2rem" }} />
          <Typography
            variant="body2"
            sx={{ flex: 1, minWidth: 0, color: "text.primary", fontSize: "0.95rem", fontWeight: 500 }}
          >
            Quiz {globalIndex}: {item.title}
          </Typography>
          {item.quizId > 0 && (
            <Chip label="Saved" size="small" color="success" variant="outlined" sx={{ fontSize: 11 }} />
          )}
        </Box>

        <IconButton size="small" onClick={() => setIsEditingTitle(true)} sx={{ color: "text.secondary" }}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(item.itemId)} sx={{ color: "error.main" }}>
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

export default QuizItem;
