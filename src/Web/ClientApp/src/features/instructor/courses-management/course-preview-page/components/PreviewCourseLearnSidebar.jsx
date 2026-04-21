import React, { useState } from "react";
import { Box, Typography, IconButton, Checkbox, Collapse, Button, Menu, MenuItem } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function PreviewCourseLearnSidebar({ onClose, courseContents, expandedSections, handleSectionToggle, selectedItem, handleItemClick }) {
  const [resourceMenuAnchor, setResourceMenuAnchor] = useState(null);
  const [currentResources, setCurrentResources] = useState([]);

  const calculateSectionStats = (section) => {
    const totalItems = section.items.length;
    const completedItems = 0; // Fixed 0 in preview mode
    const totalDuration = section.items.reduce((acc, item) => {
      if (item.videoDuration && item.contentType === 'video') {
        const parts = item.videoDuration.replace(/\\"/g, '').split(':').map(Number);
        let seconds = 0;
        if (parts.length === 3) {
          seconds = (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        } else if (parts.length === 2) {
          seconds = (parts[0] * 60) + parts[1];
        } else if (parts.length === 1) {
          seconds = parts[0];
        }
        return acc + seconds;
      }
      return acc;
    }, 0);

    const minutes = Math.floor(totalDuration / 60);
    const seconds = totalDuration % 60;
    const durationStr = minutes > 0 ? `${minutes}min` : `${seconds}s`;

    return { completedItems, totalItems, durationStr };
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
                  {section.items.map((item, itemIndex) => {
                    const isSelected = selectedItem?.itemId === item.itemId;
                    return (
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
                            bgcolor: isSelected
                              ? "#effcf9ff"
                              : "background.paper",
                            "&:hover": {
                              bgcolor: isSelected
                                ? "brand.lighter"
                                : "background.alt"
                            },
                            borderBottom: itemIndex < section.items.length - 1 ? 1 : 0,
                            borderColor: "divider",
                            borderLeft: isSelected ? "4px solid" : "4px solid transparent",
                            borderLeftColor: isSelected ? "brand.main" : "transparent",
                            transition: "all 0.2s"
                          }}
                        >
                          <Checkbox
                            checked={false}
                            disabled
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
                                    {item.videoDuration.replace(/"/g, '')}
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
                    );
                  })}
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
