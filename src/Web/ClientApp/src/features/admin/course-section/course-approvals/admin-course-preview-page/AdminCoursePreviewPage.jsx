import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Slide, CircularProgress, Typography, useMediaQuery } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PreviewCourseLearnHeader from "../../../../instructor/courses-management/course-preview-page/components/PreviewCourseLearnHeader";
import PreviewCourseLearnSidebar from "../../../../instructor/courses-management/course-preview-page/components/PreviewCourseLearnSidebar";
import PreviewCourseContent from "../../../../instructor/courses-management/course-preview-page/components/PreviewCourseContent";


export default function AdminCoursePreviewPage() {
  const { courseId } = useParams();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const [courseContents, setCourseContents] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const channel = new BroadcastChannel(`preview_channel_${courseId}`);

    channel.onmessage = (event) => {
      if (event.data.type === "SEND_DATA") {
        const sections = event.data.payload;
        setCourseContents(sections);
        console.log("courseContents: ", sections);
        setIsLoading(false);
        if (sections.length > 0) {
          setExpandedSections({ [sections[0].sectionId]: true });
          if (sections[0].items?.length > 0) {
            setSelectedItem(sections[0].items[0]);
          }
        }
      }
    };



    channel.postMessage({ type: "REQUEST_DATA" });
    return () => channel.close();
  }, [courseId]);

  const handleSectionToggle = (sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (isMobile) setIsSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Loading course preview…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box sx={{ position: "sticky", top: 0, zIndex: 1100 }}>
        <PreviewCourseLearnHeader courseTitle="Admin Course Preview" courseContents={courseContents} />
      </Box>

      <Box sx={{ display: "flex", flex: 1, position: "relative" }}>
        <Box sx={{ flex: 1, bgcolor: "#1c1d1f", position: "relative", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 72px)" }}>
          <PreviewCourseContent selectedItem={selectedItem} courseId={String(courseId)} />

          {!isSidebarOpen && (
            <Box sx={{ position: "absolute", top: "20px", right: 0, zIndex: 10 }}>
              <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => setIsSidebarOpen(true)}
                sx={{ bgcolor: "#2d2f31", color: "white", borderTopRightRadius: 0, borderBottomRightRadius: 0, boxShadow: 3, "&:hover": { bgcolor: "#3e4143" } }} />
            </Box>
          )}
        </Box>

        <Slide direction="left" in={isSidebarOpen} mountOnEnter unmountOnExit>
          <Box sx={{
            width: "350px", borderLeft: "1px solid #3e4143", bgcolor: "#fff", display: "flex", flexDirection: "column",
            position: isMobile ? "fixed" : "sticky",
            top: { xs: "64px", md: "72px" }, right: 0, bottom: 0, height: "calc(100vh - 72px)", overflowY: "auto", zIndex: 1000,
          }}>
            <PreviewCourseLearnSidebar
              onClose={() => setIsSidebarOpen(false)}
              courseContents={courseContents}
              expandedSections={expandedSections}
              handleSectionToggle={handleSectionToggle}
              selectedItem={selectedItem}
              handleItemClick={handleItemClick}
            />
          </Box>
        </Slide>
      </Box>
    </Box>
  );
}
