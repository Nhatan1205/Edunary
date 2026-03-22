import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  Collapse,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  DragIndicator as DragIndicatorIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  OndemandVideo as OndemandVideoIcon,
  Article as ArticleIcon,
  InsertDriveFileOutlined as InsertDriveFileOutlinedIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import TitleInputForm from "./TitleInputForm";
import TextEditor from "../../../../../components/TextEditor";
import VideoContent from "./VideoContent";
import ArticleContent from "./ArticleContent";
import ResourceContent from "./ResourceContent";
import ConfirmDialog from "../../../../../components/ConfirmDialogPopup/ConfirmDialog";
import useSetCourseIdForContent from "../../../../../hooks/course-content-hooks/useSetCourseIdForContent";

function LectureItem({ item, globalIndex, onDelete, onUpdate, dndRef, dndStyle, dndAttributes, dndListeners, isDragging }) {
  const setCourseIdForContent = useSetCourseIdForContent();

  const [expanded, setExpanded] = useState(false);
  const [showDescriptionForm, setShowDescriptionForm] = useState(false);
  const [description, setDescription] = useState(item.description || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showContentTypeSelector, setShowContentTypeSelector] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState(item.contentType || null);
  const [showResourcesForm, setShowResourcesForm] = useState(false);
  const [showDeleteResourceConfirm, setShowDeleteResourceConfirm] = useState(false);
  const [pendingDeleteResource, setPendingDeleteResource] = useState(null);

  const handleSaveDescription = () => {
    // Strip HTML tags to check if content is actually empty
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = description;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    if (onUpdate) {
      // Only save if there's actual content
      onUpdate(item.itemId, { description: textContent.trim() ? description : "" });
    }
    setShowDescriptionForm(false);
  };

  const handleCancelDescription = () => {
    setDescription(item.description || "");
    setShowDescriptionForm(false);
  };

  const handleEditTitle = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitle = (data) => {
    if (onUpdate) {
      onUpdate(item.itemId, { title: data.title });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
  };

  const handleAddContent = () => {
    setShowContentTypeSelector(true);
    setShowDescriptionForm(false);
    setShowResourcesForm(false);
  };

  const handleSelectContentType = (contentType) => {
    setShowContentTypeSelector(false);
    setSelectedContentType(contentType);

    if (onUpdate) {
      onUpdate(item.itemId, { contentType });
    }
  };

  const handleCancelContent = (showSelector = false) => {
    setSelectedContentType(null);
    // If showSelector is true (from replace content type), show selector immediately
    // Otherwise, only show selector if no content exists
    if (showSelector || !item.content) {
      setShowContentTypeSelector(true);
    } else {
      setShowContentTypeSelector(false);
    }
  };

  const handleAddDescription = () => {
    setShowDescriptionForm(true);
    setShowContentTypeSelector(false);
    // Don't clear selectedContentType if content already exists
    if (!item.content) {
      setSelectedContentType(null);
    }
    setShowResourcesForm(false);
  };

  const handleAddResources = () => {
    setShowResourcesForm(true);
    setShowDescriptionForm(false);
    setShowContentTypeSelector(false);
    // Don't clear selectedContentType if content already exists
    if (!item.content) {
      setSelectedContentType(null);
    }
  };

  const handleCancelResources = () => {
    setShowResourcesForm(false);
  };

  const handleDeleteResource = (resource) => {
    setPendingDeleteResource(resource);
    setShowDeleteResourceConfirm(true);
  };

  const handleConfirmDeleteResource = async () => {
    if (pendingDeleteResource) {
      // Unset courseId for the content
      await setCourseIdForContent.mutateAsync({
        contentIds: [pendingDeleteResource.id],
        courseId: null
      });

      const updatedResources = (item.resources || []).filter(
        r => r.id !== pendingDeleteResource.id
      );
      onUpdate(item.itemId, { resources: updatedResources });

      setShowDeleteResourceConfirm(false);
      setPendingDeleteResource(null);
    }
  };

  const handleCancelDeleteResource = () => {
    setShowDeleteResourceConfirm(false);
    setPendingDeleteResource(null);
  };

  const hasDescriptionContent = (desc) => {
    if (!desc) return false;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = desc;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    return textContent.trim().length > 0;
  };

  if (isEditingTitle) {
    return (
      <TitleInputForm
        label={`Lecture ${globalIndex}`}
        initialTitle={item.title}
        onSave={handleSaveTitle}
        onCancel={handleCancelEditTitle}
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
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: "background.surface",
        boxShadow: isDragging ? 2 : 0,
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 1,
        "&:hover": {
          bgcolor: "background.alt",
        },
      }}>
        <IconButton
          size="small"
          {...dndAttributes}
          {...dndListeners}
          style={{ cursor: "grab" }}
          sx={{
            color: "text.secondary",
            "&:active": { cursor: "grabbing" },
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
          <ArticleIcon sx={{ color: "brand.main", fontSize: "1.2rem" }} />
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              minWidth: 0,
              color: "text.primary",
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
          >
            Lecture {globalIndex}: {item.title}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={handleEditTitle}
          sx={{ color: "text.secondary" }}
        >
          <EditIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => onDelete(item.itemId)}
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

      {/* Expanded Content */}
      <Collapse in={expanded}>
        <Box sx={{
          px: 2,
          pb: 2,
          pt: 0,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
            {/* Content Type Selector */}
            {showContentTypeSelector && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      fontSize: "0.9rem"
                    }}
                  >
                    Select the main type of content. Files and links can be added as resources.
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setShowContentTypeSelector(false)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      color: "text.secondary",
                      minWidth: "auto",
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </Button>
                </Box>

                <Box sx={{ display: "flex", gap: 2, maxWidth: "400px" }}>
                  {/* Video */}
                  <Box
                    onClick={() => handleSelectContentType("video")}
                    sx={{
                      flex: 1,
                      p: 1,
                      border: (theme) => `2px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      textAlign: "center",
                      cursor: "pointer",
                      bgcolor: "background.paper",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "brand.main",
                        bgcolor: "brand.lighter",
                      },
                    }}
                  >
                    <OndemandVideoIcon
                      sx={{
                        fontSize: "1.5rem",
                        color: "text.secondary",
                        mb: 0.5
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        fontSize: "0.875rem"
                      }}
                    >
                      Video
                    </Typography>
                  </Box>

                  {/* Article */}
                  <Box
                    onClick={() => handleSelectContentType("article")}
                    sx={{
                      flex: 1,
                      p: 1,
                      border: (theme) => `2px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      textAlign: "center",
                      cursor: "pointer",
                      bgcolor: "background.paper",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "brand.main",
                        bgcolor: "brand.lighter",
                      },
                    }}
                  >
                    <ArticleIcon
                      sx={{
                        fontSize: "1.5rem",
                        color: "text.secondary",
                        mb: 0.5
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        fontSize: "0.875rem"
                      }}
                    >
                      Article
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Video Content Component */}
            {(selectedContentType === 'video' || (item.content && !selectedContentType)) && (
              <VideoContent item={item} onUpdate={onUpdate} onCancel={handleCancelContent} />
            )}

            {/* Article Content Component */}
            {selectedContentType === 'article' && (
              <ArticleContent item={item} onUpdate={onUpdate} onCancel={handleCancelContent} />
            )}

            {/* Show + Content button if no content type selected and no content uploaded */}
            {!selectedContentType && !showContentTypeSelector && !item.content && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                size="small"
                onClick={handleAddContent}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "brand.main",
                  borderColor: "brand.main",
                  justifyContent: "flex-start",
                  width: "fit-content",
                  "&:hover": {
                    borderColor: "brand.dark",
                    bgcolor: "brand.lighter",
                  },
                }}
              >
                Content
              </Button>
            )}

            {/* Description Form */}
            {showDescriptionForm && (
              <Box sx={{
                mb: 2,
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                pt: 2,
                pb: 2,
              }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 700,
                    color: "text.primary",
                    fontSize: "0.95rem"
                  }}
                >
                  Lecture Description
                </Typography>

                <TextEditor
                  value={description}
                  onChange={setDescription}
                  buttons={['bold', 'italic', 'underline', '|', 'ul', 'ol']}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                  <Button
                    onClick={handleCancelDescription}
                    sx={{
                      color: "text.primary",
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveDescription}
                    variant="contained"
                    sx={{
                      bgcolor: "brand.main",
                      color: "white",
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      "&:hover": {
                        bgcolor: "brand.dark",
                      },
                    }}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            )}

            {/* Description - Show as clickable text if exists, otherwise show button */}
            {!showDescriptionForm && hasDescriptionContent(item.description) && (
              <Box
                onClick={handleAddDescription}
                sx={{
                  p: 1.5,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  cursor: "pointer",
                  maxHeight: "150px",
                  overflow: "hidden",
                  position: "relative",
                  "&:hover": {
                    bgcolor: "background.alt",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.875rem",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    "& *": {
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              </Box>
            )}

            {!showDescriptionForm && !hasDescriptionContent(item.description) && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                size="small"
                onClick={handleAddDescription}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "brand.main",
                  borderColor: "brand.main",
                  justifyContent: "flex-start",
                  width: "fit-content",
                  "&:hover": {
                    borderColor: "brand.dark",
                    bgcolor: "brand.lighter",
                  },
                }}
              >
                Description
              </Button>
            )}

            {/* Display Resources List when not showing form */}
            {!showResourcesForm && item.resources && item.resources.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  bgcolor: "background.paper",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    fontSize: "0.9rem",
                  }}
                >
                  Downloadable materials
                </Typography>
                <List sx={{ p: 0 }}>
                  {item.resources.map((resource, index) => (
                    <ListItem
                      key={resource.id || index}
                      sx={{
                        px: 0,
                        py: 1,
                        borderBottom: index < item.resources.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <InsertDriveFileOutlinedIcon
                        sx={{
                          mr: 1.5,
                          color: "text.secondary",
                          fontSize: "1rem"
                        }}
                      />
                      <ListItemText
                        primary={resource.fileName}
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: "0.8rem",
                              color: "text.primary",
                            }
                          }
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteResource(resource)}
                        sx={{
                          color: "text.secondary",
                          "&:hover": {
                            color: "error.main",
                            bgcolor: "error.lighter",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Resource Content Component */}
            {showResourcesForm && (
              <ResourceContent item={item} onUpdate={onUpdate} onClose={handleCancelResources} />
            )}

            {/* Always show + Resources button */}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
              onClick={handleAddResources}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "brand.main",
                color: "brand.main",
                justifyContent: "flex-start",
                width: "fit-content",
                "&:hover": {
                  borderColor: "brand.dark",
                  bgcolor: "brand.lighter",
                },
              }}
            >
              Resources
            </Button>
          </Box>
        </Box>
      </Collapse>

      <ConfirmDialog
        open={showDeleteResourceConfirm}
        title="Remove Resource"
        message={`Are you sure you want to remove a resource "${pendingDeleteResource?.fileName}"?`}
        onConfirm={handleConfirmDeleteResource}
        onClose={handleCancelDeleteResource}
      />
    </Paper>
  );
}

export default LectureItem;