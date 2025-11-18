import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Typography,
  Collapse,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  DragIndicator as DragIndicatorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import TitleInputForm from "./TitleInputForm";

function SortableSection({ section, sectionIndex, onAddItem, onDeleteSection, onUpdateSection, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.sectionId });

  const [expanded, setExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(section.isEditMode || false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = (data) => {
    onUpdateSection(section.sectionId, {
      ...data,
      isEditMode: false,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (!section.title) {
      // New section without title - delete it
      onDeleteSection(section.sectionId);
    } else {
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      data-type="section"
      sx={{
        mb: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: isDragging ? 4 : 1,
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {isEditing ? (
          /* Edit Mode - Inline Form */
          <Box>
            <TitleInputForm
              label={section.title ? `Section ${sectionIndex + 1}` : "New Section"}
              initialTitle={section.title || ""}
              showLearningObjectives={true}
              initialLearningObjectives={section.learningObjectives || ""}
              onSave={handleSave}
              onCancel={handleCancel}
              saveButtonText={section.title ? "Save Section" : "Add Section"}
              paperProps={{ border: "none", boxShadow: 0, mb: 0, p: 0 }}
            />

            {/* Show items even in edit mode with separator */}
            {section.items && section.items.length > 0 && (
              <>
                <Box 
                  sx={{ 
                    borderTop: (theme) => `2px solid ${theme.palette.divider}`,
                    my: 2,
                  }} 
                />
                <Collapse in={true}>
                  <Box sx={{ pl: 5 }}>
                    {children}
                  </Box>
                </Collapse>
              </>
            )}
          </Box>
        ) : (
          /* View Mode - Section Header */
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <IconButton
                size="small"
                {...attributes}
                {...listeners}
                style={{ cursor: "grab" }}
                sx={{
                  color: "text.secondary",
                  "&:active": { cursor: "grabbing" },
                }}
              >
                <DragIndicatorIcon />
              </IconButton>

              <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.primary",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  Section {sectionIndex + 1}: {section.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Switch
                    checked={section.published || false}
                    onChange={(e) => onUpdateSection(section.sectionId, { published: e.target.checked })}
                    size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "brand.main",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        bgcolor: "brand.main",
                      },
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: "0.875rem", 
                      fontWeight: 600,
                      color: section.published ? "success.main" : "warning.main",
                    }}
                  >
                    {section.published ? "Published" : "Draft"}
                  </Typography>
                </Box>
              </Box>

              <IconButton
                size="small"
                onClick={handleEdit}
                sx={{ color: "text.secondary" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              
              <IconButton
                size="small"
                onClick={() => onDeleteSection(section.sectionId)}
                sx={{ color: "error.main" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ color: "text.secondary" }}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            {/* Curriculum Items */}
            <Collapse in={expanded}>
              <Box sx={{ pl: 5 }}>
                {children}

                {/* Add Curriculum Item Button - Hide if there's a pending item */}
                {!section.items.some(item => item.isPendingType) && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => onAddItem(section.sectionId)}
                    sx={{
                      mt: 2,
                      color: "brand.main",
                      borderColor: "brand.main",
                      "&:hover": {
                        borderColor: "brand.dark",
                        bgcolor: "brand.lighter",
                      },
                    }}
                    variant="outlined"
                    size="small"
                  >
                      Curriculum Item
                  </Button>
                )}
              </Box>
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default SortableSection;