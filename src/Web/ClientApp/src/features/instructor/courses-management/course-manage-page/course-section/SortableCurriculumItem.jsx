import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  VideoLibrary as VideoIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import TitleInputForm from "./TitleInputForm";
import LectureItem from "./lecture-item/LectureItem";
import QuizItem from "./quiz-item/QuizItem";
import AssignmentItem from "./assignment-item/AssignmentItem";

function SortableCurriculumItem({ item, globalIndex, onDelete, onUpdate, sections = [] }) {
  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging,
  } = useSortable({ id: item.itemId });

  const [itemType, setItemType] = useState(item.type);
  const [showTitleInput, setShowTitleInput] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSelectType = (type) => {
    setItemType(type);
    setShowTitleInput(true);
  };

  const handleAddItem = (data) => {
    if (onUpdate) {
      onUpdate(item.itemId, {
        type: itemType,
        isPendingType: false,
        title: data.title
      });
    }
    setShowTitleInput(false);
  };

  const handleCancelTitleInput = () => {
    setItemType(null);
    setShowTitleInput(false);
    onDelete(item.itemId);
  };

  const getItemTypeLabel = (type) => {
    switch (type) {
      case "lecture":
        return "Lecture";
      case "quiz":
        return "Quiz";
      case "coding_exercise":
        return "Coding Exercise";
      case "assignment":
        return "Assignment";
      default:
        return "";
    }
  };

  // Show type selector if item type is not set
  if (item.isPendingType) {
    // Show title input form after type is selected
    if (showTitleInput && itemType) {
      return (
        <TitleInputForm
          label={`New ${getItemTypeLabel(itemType)}`}
          onSave={handleAddItem}
          onCancel={handleCancelTitleInput}
          saveButtonText={`Add ${getItemTypeLabel(itemType)}`}
          dragRef={setNodeRef}
          dragStyle={style}
        />
      );
    }

    // Show type selector initially
    return (
      <Paper
        ref={setNodeRef}
        style={style}
        data-type="item"
        sx={{
          mb: 1.5,
          p: 2,
          border: (theme) => `2px dashed ${theme.palette.brand.main}`,
          bgcolor: "background.paper",
          boxShadow: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
            {/* Lecture */}
            <Button
              variant="outlined"
              startIcon={<VideoIcon />}
              onClick={() => handleSelectType("lecture")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "brand.main",
                color: "brand.main",
                "&:hover": {
                  borderColor: "brand.dark",
                  bgcolor: "brand.lighter",
                },
              }}
            >
              Lecture
            </Button>

            {/* Quiz */}
            <Button
              variant="outlined"
              startIcon={<QuizIcon />}
              onClick={() => handleSelectType("quiz")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "brand.main",
                color: "brand.main",
                "&:hover": {
                  borderColor: "brand.dark",
                  bgcolor: "brand.lighter",
                },
              }}
            >
              Quiz
            </Button>

            {/* Coding Exercise - Disabled */}
            <Tooltip title="Coming soon" arrow>
              <span>
                <Button
                  variant="outlined"
                  startIcon={<CodeIcon />}
                  disabled
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Coding Exercise
                </Button>
              </span>
            </Tooltip>

            {/* Assignment */}
            <Button
              variant="outlined"
              startIcon={<AssignmentIcon />}
              onClick={() => handleSelectType("assignment")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "brand.main",
                color: "brand.main",
                "&:hover": {
                  borderColor: "brand.dark",
                  bgcolor: "brand.lighter",
                },
              }}
            >
              Assignment
            </Button>
          </Box>

          <IconButton
            size="small"
            onClick={() => onDelete(item.itemId)}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    );
  }

  // Delegate to specific item type component
  switch (item.type) {
    case "lecture":
      return (
        <LectureItem
          item={item}
          globalIndex={globalIndex}
          onDelete={onDelete}
          onUpdate={onUpdate}
          dndRef={setNodeRef}
          dndStyle={style}
          dndAttributes={attributes}
          dndListeners={listeners}
          isDragging={isDragging}
        />
      );
    case "quiz":
      return (
        <QuizItem
          item={item}
          globalIndex={globalIndex}
          onDelete={onDelete}
          onUpdate={onUpdate}
          dndRef={setNodeRef}
          dndStyle={style}
          dndAttributes={attributes}
          dndListeners={listeners}
          isDragging={isDragging}
          sections={sections}
        />
      );
    case "coding_exercise":
      // TODO: Implement CodingExerciseItem
      return null;
    case "assignment":
      return (
        <AssignmentItem
          item={item}
          globalIndex={globalIndex}
          onDelete={onDelete}
          onUpdate={onUpdate}
          dndRef={setNodeRef}
          dndStyle={style}
          dndAttributes={attributes}
          dndListeners={listeners}
          isDragging={isDragging}
          sections={sections}
        />
      );
    default:
      return null;
  }
}

export default SortableCurriculumItem;