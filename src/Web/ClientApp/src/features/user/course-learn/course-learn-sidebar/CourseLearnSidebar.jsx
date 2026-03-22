import {
  Box,
  Typography,
  IconButton,
  Checkbox,
  Button,
  Menu,
  MenuItem,
  Collapse,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useParams, useNavigate } from "react-router-dom";
import useGetLearningSidebar from "../../../../hooks/course-progress-hooks/useGetLearningSidebar";
import useUpdateCompleteCP from "../../../../hooks/course-progress-hooks/useUpdateCompleteCP";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { useState, useEffect } from "react";

function CourseLearnSidebar({ onClose }) {
  const { courseId, contentId } = useParams();
  const navigate = useNavigate();
  const { data: courseProgressData, isLoading } = useGetLearningSidebar(courseId);
  const updateProgressMutation = useUpdateCompleteCP();
  const [courseContents, setCourseContents] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [resourceMenuAnchor, setResourceMenuAnchor] = useState(null);
  const [currentResources, setCurrentResources] = useState([]);

  useEffect(() => {
    if (courseProgressData && courseProgressData.progress) {
      const courseContent = JSON.parse(courseProgressData?.progress)?.contents || [];
      setCourseContents(courseContent);
      let activeSectionId = null;
      if (contentId) {
        const foundSection = courseContent.find(section =>
          section.items?.some(item => item.itemId === contentId)
        );
        if (foundSection) {
          activeSectionId = foundSection.sectionId;
        }
      }
      if (!activeSectionId && courseContent.length > 0) {
        activeSectionId = courseContent[0].sectionId;
      }
      if (activeSectionId) {
        setExpandedSections(prev => ({
          ...prev,
          [activeSectionId]: true
        }));
      }
    }
  }, [courseProgressData, contentId]);


  const handleCheckboxChange = async (event, sectionId, itemId, currentStatus) => {
    event.stopPropagation();
    const newStatus = !currentStatus;
    setCourseContents(prevContents =>
      prevContents.map(section => {
        if (section.sectionId === sectionId) {
          return {
            ...section,
            items: section.items.map(item => {
              if (item.itemId === itemId) {
                return { ...item, isCompleted: newStatus };
              }
              return item;
            })
          };
        }
        return section;
      })
    );
    try {
      await updateProgressMutation.mutateAsync({
        courseId: Number(courseId),
        itemId: itemId,
        isCompleted: newStatus,
      });
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleSectionToggle = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleResourceClick = (event, resources) => {
    event.stopPropagation();
    if (resources && resources.length > 0) {
      setCurrentResources(resources);
      setResourceMenuAnchor(event.currentTarget);
    }
  };

  const handleResourceMenuClose = () => {
    setResourceMenuAnchor(null);
    setCurrentResources([]);
  };

  const handleResourceItemClick = (url) => {
    window.open(url, '_blank');
    handleResourceMenuClose();
  };

  const getItemIcon = (item) => {
    if (item.contentType === 'video') {
      return <PlayCircleOutlineIcon sx={{ fontSize: 18, color: 'text.secondary' }} />;
    } else if (item.contentType === 'article') {
      return <ArticleOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />;
    } else {
      return <DescriptionOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />;
    }
  };

  const calculateSectionStats = (section) => {
    const totalItems = section.items.length;
    const completedItems = section.items.filter(item => item.isCompleted).length;
    const totalDuration = section.items.reduce((acc, item) => {
      if (item.videoDuration && item.contentType === 'video') {
        const [minutes, seconds] = item.videoDuration.split(':').map(Number);
        return acc + (minutes * 60) + seconds;
      }
      return acc;
    }, 0);

    const minutes = Math.floor(totalDuration / 60);
    const seconds = totalDuration % 60;
    const durationStr = minutes > 0 ? `${minutes}min` : `${seconds}s`;

    return { completedItems, totalItems, durationStr };
  };

  const handleItemClick = (item) => {
    const routeType = item.type === 'quiz' ? 'quiz' : 'lecture';
    navigate(`/course/${courseId}/learn/${routeType}/${item.itemId}`);
    if (onClose && window.innerWidth < 900) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>

      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider"
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem", color: "text.primary" }}>
          Course content
        </Typography>

        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {courseContents.map((section, sectionIndex) => {
          const { completedItems, totalItems, durationStr } = calculateSectionStats(section);
          const isExpanded = expandedSections[section.sectionId];

          return (
            <Box key={section.sectionId} sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Box
                onClick={() => handleSectionToggle(section.sectionId)}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "background.alt" },
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>
                    Section {sectionIndex + 1}: {section.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                    {completedItems} / {totalItems} | {durationStr}
                  </Typography>
                </Box>
                <IconButton size="small" sx={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s'
                }}>
                  <ExpandMoreIcon />
                </IconButton>
              </Box>

              <Collapse in={isExpanded}>
                <Box sx={{ bgcolor: "background.surface" }}>
                  {section.items.map((item, itemIndex) => (
                    <Box
                      key={item.itemId}
                      onClick={() => handleItemClick(item)}
                      sx={{ cursor: "pointer" }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          pl: 3,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                          bgcolor: item.itemId === contentId
                            ? "#effcf9ff"
                            : item.isCompleted
                              ? "background.muted"
                              : "background.paper",
                          // bgcolor: item.isCompleted ? "background.muted" : "background.paper",
                          "&:hover": {
                            bgcolor: item.itemId === contentId
                              ? "brand.lighter"
                              : "background.alt"
                          },
                          // "&:hover": { bgcolor: "background.alt" },
                          borderBottom: itemIndex < section.items.length - 1 ? 1 : 0,
                          borderColor: "divider",
                          borderLeft: item.itemId === contentId ? "4px solid" : "4px solid transparent",
                          borderLeftColor: item.itemId === contentId ? "brand.main" : "transparent",
                          transition: "all 0.2s"
                        }}
                      >
                        <Checkbox
                          checked={item.isCompleted || false}
                          onClick={(e) => handleCheckboxChange(e, section.sectionId, item.itemId, item.isCompleted)}
                          sx={{
                            color: "text.disabled",
                            p: 0,
                            '&.Mui-checked': {
                              color: "brand.main"
                            }
                          }}
                        />

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            {getItemIcon(item)}
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                color: "text.primary",
                              }}
                            >
                              {itemIndex + 1}. {item.title}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                            <Box>
                              {(item.videoDuration && item.contentType === 'video') && (
                                <Typography variant="caption" sx={{ color: "text.tertiary" }}>
                                  {item.videoDuration}
                                </Typography>
                              )}
                            </Box>

                            <Box>
                              {item.resources && item.resources.length > 0 && (
                                <Button
                                  size="small"
                                  onClick={(e) => handleResourceClick(e, item.resources)}
                                  startIcon={<FolderOpenOutlinedIcon sx={{ fontSize: 16 }} />}
                                  endIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
                                  sx={{
                                    textTransform: "none",
                                    color: "brand.main",
                                    fontSize: "0.75rem",
                                    minWidth: "auto",
                                    p: 0.5,
                                    "&:hover": { bgcolor: "brand.light", color: "white" }
                                  }}
                                >
                                  Resources
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      <Menu
        anchorEl={resourceMenuAnchor}
        open={Boolean(resourceMenuAnchor)}
        onClose={handleResourceMenuClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              boxShadow: 3,
              minWidth: 200
            }
          }
        }}
      >
        {currentResources.map((resource, index) => (
          <MenuItem
            key={index}
            onClick={() => handleResourceItemClick(resource.fileUrl)}
            sx={{
              display: "flex",
              gap: 1.5,
              py: 1.5,
              "&:hover": { bgcolor: "background.alt" }
            }}
          >
            <OpenInNewIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              {resource.fileName}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

    </Box>
  );
}

export default CourseLearnSidebar;