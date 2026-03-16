import { Container } from "reactstrap";
import AlertBox from "../../../../../components/AlertBox";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box, Button, Card, CardContent, Typography, Paper, Divider } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useParams } from "react-router";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import SortableSection from "../course-section/SortableSection";
import SortableCurriculumItem from "../course-section/SortableCurriculumItem";
import ConfirmDialog from "../../../../../components/ConfirmDialogPopup/ConfirmDialog";
import useSetCourseIdForContent from "../../../../../hooks/useSetCourseIdForContent";
import useGetCourseById from "../../../../../hooks/useGetCourseById";
import useUpdateCourse from "../../../../../hooks/useUpdateCourse";
import { useBlocker } from "react-router-dom";
import SaveChangesDialog from "../../../../../components/ConfirmDialogPopup/SaveChangesDialog";

function CourseCurriculum() {
  const { courseId } = useParams();
  const setCourseIdForContent = useSetCourseIdForContent();
  const { data: courseData, isLoading: isCourseDataLoading } = useGetCourseById(courseId);
  const updatecourseMutation = useUpdateCourse();
  const isUpdating = updatecourseMutation.isPending || updatecourseMutation.isLoading;
  const [sections, setSections] = useState([]);
  const [initialContent, setInitialContent] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null); 
  const [nextSectionId, setNextSectionId] = useState(1);
  const [nextItemId, setNextItemId] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (courseData) {
      const initialSections = courseData?.content
        ? JSON.parse(courseData.content)?.contents || []
        : [];
      const initialNextSectionId = courseData?.content
        ? JSON.parse(courseData.content)?.nextSectionId || 1
        : 1;
      const initialNextItemId = courseData?.content
        ? JSON.parse(courseData.content)?.nextItemId || 1
        : 1;
      setSections(initialSections);
      setInitialContent(initialSections);
      setNextSectionId(initialNextSectionId);
      setNextItemId(initialNextItemId);
    }
  }, [courseData]);

  const getGlobalIndex = (sectionIndex, itemIndex) => {
    let count = 1;
    for (let i = 0; i < sectionIndex; i++) {
      count += sections[i].items.length;
    }
    return count + itemIndex;
  };

  // Validate curriculum content
  const validateCurriculumContent = () => {
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      // Validate section title
      if (!section.title || !section.title.trim()) {
        return {
          isValid: false,
          errorMessage: `Section ${i + 1} must have a title.`,
        };
      }
      
      // Validate curriculum items in the section
      for (let j = 0; j < section.items.length; j++) {
        const item = section.items[j];
        if (!item.title || !item.title.trim()) {
          return {
            isValid: false,
            errorMessage: `Section ${i + 1}, Item ${j + 1} must have a title.`,
          };
        }
      }
    }
    
    return { isValid: true };
  };

  // Add new section
  const addSection = () => {
    const newSection = {
      sectionId: `section-${nextSectionId}`,
      title: "",
      learningObjectives: "",
      items: [],
      isEditMode: true, 
      published: false,
    };
    setSections([...sections, newSection]);
    setNextSectionId(nextSectionId + 1);
  };

  // Update section
  const updateSection = (sectionId, data) => {
    setSections(sections.map(section =>
      section.sectionId === sectionId
        ? { ...section, ...data }
        : section
    ));
  };

  // Delete section
  const deleteSection = async (sectionId) => {
    const section = sections.find(s => s.sectionId === sectionId);
    // If it's a new unsaved section, delete directly without confirmation
    if (!section.title) {
      setSections(sections.filter((s) => s.sectionId !== sectionId));
      return;
    }
    // Show confirmation dialog for saved sections
    setConfirmDialog({
      open: true,
      title: "Delete Section",
      message: "Are you sure you want to delete this section? All curriculum items inside will also be deleted.",
      onConfirm: async () => {
        // Collect all video IDs and resource IDs from all items in this section
        const videoIds = section.items
          .filter(item => item.videoId)
          .map(item => item.videoId);
        
        const resourceIds = section.items
          .flatMap(item => item.resources || [])
          .map(resource => resource.id)
          .filter(id => id);
        
        const allContentIds = [...videoIds, ...resourceIds];
        
        if (allContentIds.length > 0) {
          await setContentIds(allContentIds, null);
        }
        
        setSections(sections.filter((s) => s.sectionId !== sectionId));
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  // Add curriculum item to section
  const addCurriculumItem = (sectionId) => {
    const newSections = sections.map((section) => {
      if (section.sectionId === sectionId) {
        const newItem = {
          itemId: `item-${nextItemId}`,
          title: "",
          description: "",
          content: "",
          type: null, 
          isPendingType: true,
          downloadable: false,
          resources: []
        };
        setNextItemId(nextItemId + 1);
        return {
          ...section,
          items: [...section.items, newItem],
        };
      }
      return section;
    });
    setSections(newSections);
  };

  // Update curriculum item
  const updateCurriculumItem = (sectionId, itemId, data) => {
    const newSections = sections.map((section) => {
      if (section.sectionId === sectionId) {
        return {
          ...section,
          items: section.items.map((item) =>
            item.itemId === itemId ? { ...item, ...data } : item
          ),
        };
      }
      return section;
    });
    setSections(newSections);
  };

  // Delete curriculum item
  const deleteCurriculumItem = async (sectionId, itemId) => {
    const section = sections.find(s => s.sectionId === sectionId);
    const item = section?.items.find(i => i.itemId === itemId);
    
    // If it's pending or has no title, delete directly without confirmation
    if (item?.isPendingType || !item?.title) {
      const newSections = sections.map((section) => {
        if (section.sectionId === sectionId) {
          return {
            ...section,
            items: section.items.filter((item) => item.itemId !== itemId),
          };
        }
        return section;
      });
      setSections(newSections);
      return;
    }

    // Show confirmation dialog for saved items
    setConfirmDialog({
      open: true,
      title: "Delete Curriculum Item",
      message: "Are you sure you want to delete this curriculum item?",
      onConfirm: async () => {
        // Collect video ID and resource IDs
        const contentIds = [];
        
        if (item?.videoId) {
          contentIds.push(item.videoId);
        }
        
        if (item?.resources && item.resources.length > 0) {
          const resourceIds = item.resources.map(r => r.id).filter(id => id);
          contentIds.push(...resourceIds);
        }
        
        if (contentIds.length > 0) {
          await setContentIds(contentIds, null);
        }
        
        const newSections = sections.map((section) => {
          if (section.sectionId === sectionId) {
            return {
              ...section,
              items: section.items.filter((item) => item.itemId !== itemId),
            };
          }
          return section;
        });
        setSections(newSections);
        setConfirmDialog({ ...confirmDialog, open: false });
      },
    });
  };

  // Handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    // Determine type by ID prefix
    const isSection = String(active.id).startsWith("section-");
    setActiveType(isSection ? "section" : "item");
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveId(null);
      setActiveType(null);
      return;
    }
    if (activeType === "section") {
      // Dragging sections
      const oldIndex = sections.findIndex((s) => s.sectionId === active.id);
      const newIndex = sections.findIndex((s) => s.sectionId === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setSections(arrayMove(sections, oldIndex, newIndex));
      }
    } else if (activeType === "item") {
      // Dragging curriculum items
      let activeSectionIndex = -1;
      let activeItemIndex = -1;
      let overSectionIndex = -1;
      let overItemIndex = -1;
      // Find active item position
      sections.forEach((section, sIndex) => {
        const itemIndex = section.items.findIndex((item) => item.itemId === active.id);
        if (itemIndex !== -1) {
          activeSectionIndex = sIndex;
          activeItemIndex = itemIndex;
        }
      });
      // Find over item position - check if dropping on another item
      sections.forEach((section, sIndex) => {
        const itemIndex = section.items.findIndex((item) => item.itemId === over.id);
        if (itemIndex !== -1) {
          overSectionIndex = sIndex;
          overItemIndex = itemIndex;
        }
      });
      // If not dropping on an item, check if dropping on a section
      if (overSectionIndex === -1) {
        const sectionIndex = sections.findIndex((s) => s.sectionId === over.id);
        if (sectionIndex !== -1) {
          overSectionIndex = sectionIndex;
          overItemIndex = sections[sectionIndex].items.length; // Add to end of section
        }
      }
      if (activeSectionIndex !== -1 && overSectionIndex !== -1) {
        const newSections = [...sections];
        // Remove item from old position
        const [movedItem] = newSections[activeSectionIndex].items.splice(
          activeItemIndex,
          1
        );
        // Insert item at new position
        newSections[overSectionIndex].items.splice(overItemIndex, 0, movedItem);

        setSections(newSections);
      }
    }

    setActiveId(null);
    setActiveType(null);
  };

  // Track changes
  useEffect(() => {
    if (courseData && !isCourseDataLoading) {
      const hasChanges = JSON.stringify(sections) !== JSON.stringify(initialContent);
      setHasUnsavedChanges(hasChanges && sections.length > 0);
    }
  }, [sections, courseData, isCourseDataLoading, initialContent]);

  // Block navigation if unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && 
      currentLocation.pathname !== nextLocation.pathname
  );

  // Handle browser reload/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle blocker state
  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowSaveDialog(true);
    }
  }, [blocker.state]);

  // Handle save from dialog
  const handleSaveFromDialog = async () => {
    
    await handleUpdateCourse();
    setShowSaveDialog(false);
    setHasUnsavedChanges(false);
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
  };

  // Handle discard from dialog
  const handleDiscardChanges = async () => {
    const oldIds = getAllContentIds(initialContent); 
    const newIds = getAllContentIds(sections);        
    const addedIds = newIds.filter(id => !oldIds.includes(id));
    const removedIds = oldIds.filter(id => !newIds.includes(id));
    if (addedIds.length > 0) {
      await setContentIds(addedIds, null);
    }
    if (removedIds.length > 0 ) {
      await setContentIds(removedIds, courseId);
    }
    setShowSaveDialog(false);
    setHasUnsavedChanges(false);
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
  };

  // Handle update course
  const handleUpdateCourse = async () => {
    // Validate curriculum content before saving
    const validation = validateCurriculumContent();
    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      return;
    }

    const videoContentIds = getAllVideoContentIds(sections);
    const totalVideoDuration = getTotalVideoDuration(sections);
    const data = {
      id: courseId,
      title: courseData.title,
      contents: sections,
      nextSectionId: nextSectionId,
      nextItemId: nextItemId,
      videoContentIds: videoContentIds,
      totalVideo: videoContentIds.length,
      totalVideoDuration: totalVideoDuration,
    }
    const updateData = {
      ...courseData,
      content: JSON.stringify(data),
    };
    await updatecourseMutation.mutateAsync(updateData);
    setInitialContent(sections);
    setHasUnsavedChanges(false);
  };

  const getAllContentIds = (sections) => {
    const ids = [];

    sections.forEach(section => {
      section.items.forEach(item => {
        if (item.videoId) ids.push(item.videoId);
        if (item.resources && item.resources.length > 0) {
          item.resources.forEach(r => ids.push(r.id));
        }
      });
    });

    return ids;
  };

  const getAllVideoContentIds = (sections) => {
    const ids = [];
    sections.forEach(section => {
      section.items.forEach(item => {
        if (item.videoId) ids.push(item.videoId);
      });
    });
    return ids;
  };

  const getTotalVideoDuration = (sections) => {
    let totalSeconds = 0;
    sections.forEach(section => {
      section.items.forEach(item => {
        if (item.videoDuration) {
          const [mm, ss] = item.videoDuration.split(":").map(Number);
          totalSeconds += mm * 60 + ss;
        }
      });
    });
    const hours = totalSeconds / 3600;
    if (hours >= 1) {
      return `${hours.toFixed(1)} hours`;
    }
    const minutes = totalSeconds / 60;
    if (minutes >= 1) {
      return `${Math.round(minutes)} minutes`;
    }
    return `${totalSeconds} seconds`;
  }

  const setContentIds = async (contentIds, courseId) => {
    if (contentIds.length > 0) {
      await setCourseIdForContent.mutateAsync({ 
        contentIds: contentIds,
        courseId: courseId
      });
    }
  }

  if (isCourseDataLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Box
        sx={{ 
          display: "flex",
          justifyContent: "space-between", 
          alignItems: "center",
          mb: 2.75, 
        }}
      >
        <Typography 
          variant="h5" 
          fontWeight={600} 
        >
          Curriculum
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={handleUpdateCourse}
          disabled={isCourseDataLoading || isUpdating || !hasUnsavedChanges}
          sx={{
            bgcolor: "brand.main",
            "&:hover": {
              backgroundColor: "brand.dark",
            },
            position: "relative",
            fontWeight: 600,
          }}
        >
          {isUpdating ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LoadingSpinner size={24} />
              <span>Saving...</span>
            </Box>
          ) : (
            "Save"
          )}
        </Button>
      </Box>
      <Divider />

      <Container className="py-2">
        <AlertBox severity="info" sx={{ mb: 3 }}>
          Start putting together your course by creating sections, lectures and
          practice activities (quizzes, coding exercises and assignments).
        </AlertBox>
  
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Sections List */}
          <SortableContext
            items={sections.map((s) => s.sectionId)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section, sectionIndex) => (
              <SortableSection
                key={section.sectionId}
                section={section}
                sectionIndex={sectionIndex}
                onAddItem={addCurriculumItem}
                onDeleteSection={deleteSection}
                onUpdateSection={updateSection}
              >
                {/* Curriculum Items in this section */}
                <SortableContext
                  items={section.items.map((item) => item.itemId)}
                  strategy={verticalListSortingStrategy}
                >
                  {section.items.map((item, itemIndex) => (
                    <SortableCurriculumItem
                      key={item.itemId}
                      item={item}
                      globalIndex={getGlobalIndex(sectionIndex, itemIndex)}
                      onDelete={(itemId) => deleteCurriculumItem(section.sectionId, itemId)}
                      onUpdate={(itemId, data) => updateCurriculumItem(section.sectionId, itemId, data)}
                    />
                  ))}
                </SortableContext>
              </SortableSection>
            ))}
          </SortableContext>

          <DragOverlay>
            {activeId && (() => {
              if (activeType === "section") {
                const section = sections.find((s) => s.sectionId === activeId);
                const sectionIndex = sections.findIndex((s) => s.sectionId === activeId);
                return (
                  <Card
                    sx={{
                      opacity: 0.9,
                      bgcolor: "background.paper",
                      border: (theme) => `2px solid ${theme.palette.brand.main}`,
                      boxShadow: 4,
                      minWidth: 300,
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600 }}>
                        Section {sectionIndex + 1}: {section?.title || ""}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              } else if (activeType === "item") {
                let itemTitle = "";
                sections.forEach((section) => {
                  const item = section.items.find((i) => i.itemId === activeId);
                  if (item) itemTitle = item.title;
                });
                return (
                  <Paper
                    sx={{
                      p: 2,
                      opacity: 0.9,
                      bgcolor: "background.surface",
                      border: (theme) => `2px solid ${theme.palette.brand.main}`,
                      boxShadow: 4,
                      minWidth: 250,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {itemTitle}
                    </Typography>
                  </Paper>
                );
              }
              return null;
            })()}
          </DragOverlay>
        </DndContext>

        {/* Add Section Button - Hide if there's an unsaved section */}
        {!sections.some(s => s.isEditMode) && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={addSection}
              sx={{
                bgcolor: "brand.main",
                color: "white",
                px: 2,
                py: 0.5,
                fontSize: "1rem",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "brand.dark",
                },
              }}
            >
              Section
            </Button>
          </Box>
        )}

        {/* Save Changes Dialog */}
        <SaveChangesDialog
          open={showSaveDialog}
          onClose={handleDiscardChanges}
          onSave={handleSaveFromDialog}
        />

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          onConfirm={confirmDialog.onConfirm}
        />
      </Container>
    </>
  );
}

export default CourseCurriculum;
